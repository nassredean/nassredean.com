+++
author = "Nassredean Nasseri"
title = "Introducing Fir, the Friendly, Interactive Ruby REPL"
date = "2018-01-23"
description = "An introduction to Fir, the friendly interactive Ruby REPL."
tags = [
    "ruby",
]
categories = [
    "ruby",
]
+++

I haven’t been posting here much because most of my free time has been spent working on a Ruby REPL that I call [Fir](https://github.com/nassredean/fir), which stands for friendly-interactive-Ruby. The Ruby community has no shortage of great REPL’s — the default irb is pretty good, and [pry](https://github.com/pry/pry) offers a fantastic REPL as well as an interactive debugger that really highlights some of the great features of the Ruby language. In my daily work, I also really enjoy some of the autosuggestion features that the [fish](https://github.com/fish-shell/fish-shell) shell offers, so much so that I got to thinking about integrating those features into a Ruby REPL. If you’re not familiar with the fish shell, this is what some of those features look like in action:

![the fish shell offers terrific autosuggestion](/images/introducing-fir-img-1.gif)

As you can see, fish offers as you type autocompletion based on your history, programs in your path, and directories on your machine. It’s really quite clever, and anytime I’m using another shell, I tend to miss it. Fir does something similar, by suggesting lines from your .irb_history file:

![Fir’s autocompletion in action.](/images/introducing-fir-img-2.gif)

Fir not only offers suggestions as you type, it also indents and dedents code as you type it. Take a look at how it handles this begin/rescue block:

![begin/rescue](/images/introducing-fir-img-3.gif)

As you can see, Fir is smart enough to dedent the rescue keyword as soon as you type it. The difference between Fir and a REPL like pry (or most others) is that Fir parses the syntax and re-renders the screen every time it receives a key input, as opposed to only when the program receives select inputs like tab or enter. Since every keystroke triggers a loop and a full re-render, we can continuously update the screen with new indents, suggestions, and in the future, colorization. Like other REPLs, Fir only triggers a full evaluation of the inputted code when it forms a self contained executable block, and the user presses enter.

## Implementing as you type updates with raw input

In order to achieve the functionality described above inside our command line programs, we need to leverage “raw” terminal drivers. Terminals and REPLs usually use “cooked”, or canonical, input. With cooked input characters are buffered internally until a carriage return is inputted to the program, at which point the line is processed. Cooked functionality is actually what allows for certain characters to be treated as special, e.g. control sequences or backspace. It is on this system that programs usually base their line editing. If instead we want to manually handle characters as the program receives them, and also prevent them from being echoed to the screen, then we need to force the terminal to use a raw driver. In Ruby we can force stdin or stdout into raw mode as follows:

```ruby
while true
  $stdin.raw do |raw_input|
    raw_input.getc
  end
end
```


If you run the above program and start typing, you will see nothing happens on the screen, and that’s good! The program is fetching the raw characters, and preventing their default behavior, which in this case, is rendering them to the screen. This is essentially what Fir is based on, fetching raw input, processing it, and then manually drawing to the screen using [ANSI escape sequences](https://en.wikipedia.org/wiki/ANSI_escape_code) to do things like erase or move the cursor. It also means that we can handle the characters as we receive them, instead of waiting for a carriage return.

Now as I mentioned before, you may have noticed that trying to ctrl-d or exit the program using the standard process control characters did not work. Sorry about that! You see one of the downsides of raw terminal drivers is that you have to manually handle everything. In this case, those standard process control characters are doing nothing to end the program, so you are going to have to send that runaway Ruby process a kill signal ;).

## Capturing escape keys

Certain keys, such as the arrow keys, are prefixed by an “escape” sequence. These escape characters are actually not characters at all, but strings that begin with the escape character “\e”. For instance, the left arrow character is represented by “\e[D”. Let’s modify our raw input example to inspect and display the character we have trapped, and see what a left arrow key looks like.

```ruby
while true
  $stdin.raw do |raw_input|
    $stdout.puts "CHARACTER: #{raw_input.getc.inspect}"
  end
end
```

Run the program and then hit the left arrow key, and you should see something like this:

```
$ ruby raw_mode_example.rb
CHARACTER: "\e"
CHARACTER: "["
CHARACTER: "D"
```

What happened here? Well if we read the [documentation for getc](https://ruby-doc.org/core-2.3.0/IO.html#method-i-getc) we see that getc “Reads a one-character string from ios”, and this is not a one character string! This posed a substantial challenge for Fir, since the left arrow was broken down into its component characters, my program behaved as if the user had just hit escape, and then left bracket, and then d. Not what we want.

I stumbled into a solution [here](https://www.alecjacobson.com/weblog/?p=75). The solution is to spawn an additional thread when the program detects an escape key where we call getc on the input twice, and then kill the thread very quickly. If the escape was the beginning of the long character sequence, as in the case of left arrow, we are able to trap it, and if not the thread is killed and the program isn’t blocked waiting for more input. Here’s what that solution looks like inside the Fir key class.

```ruby
input.raw do |raw_input|
  key = raw_input.sysread(1).chr
  if key == "\e"
    skt = Thread.new { 2.times { key += raw_input.sysread(1).chr } }
    skt.join(0.0001)
    skt.kill
  end
  key
end
```
