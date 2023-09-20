+++
author = "Nassredean Nasseri"
title = "The Structure and Interpretation of Ruby Programs"
date = "2015-11-19"
description = "A brief introduction on how Ruby programs are interpreted and evaluated."
tags = [
    "ruby",
]
categories = [
    "ruby",
]
+++

Whenever a ruby program is run, the program is first lexed into tokens, then the tokens are assembled into an abstract syntax tree, and finally the AST is compiled into virtual machine instructions. In this post, we will explore each of these steps in detail.


![First the code is tokenized, then parsed, then compiled](/images/the-structure-and-interpretation-of-ruby-programs-img-1.webp)


First, an example program:

```ruby
class Math
  def add(x, y)
    x + y
  end
end     

Math.new.add(1, 2)
```

Whenever you run a ruby program, ruby steps through the characters in the program one at a time and groups them into special words called “tokens”. These tokens are not guaranteed to be valid Ruby. At this point the stream of tokens could be invalid. It is the responsibility of the parser to determine whether the inputted program is valid or not.

We can actually see how Ruby’s tokenization would treat this program using the built in tool ‘ripper’. Lets take a look at how the definition of the add method is tokenized using the following code:

```ruby
require 'ripper'
require 'pp'

code = <<CODE
def add(x, y)
  x + y
end
CODE

pp Ripper.lex(code)
```

This results in the following output:

```ruby
[[[1, 0], :on_kw, "def"],
 [[1, 3], :on_sp, " "],
 [[1, 4], :on_ident, "add"],
 [[1, 7], :on_lparen, "("],
 [[1, 8], :on_ident, "x"],
 [[1, 9], :on_comma, ","],
 [[1, 10], :on_sp, " "],
 [[1, 11], :on_ident, "y"],
 [[1, 12], :on_rparen, ")"],
 [[1, 13], :on_ignored_nl, "\n"],
 [[2, 0], :on_sp, "  "],
 [[2, 2], :on_ident, "x"],
 [[2, 3], :on_sp, " "],
 [[2, 4], :on_op, "+"],
 [[2, 5], :on_sp, " "],
 [[2, 6], :on_ident, "y"],
 [[2, 7], :on_nl, "\n"],
 [[3, 0], :on_kw, "end"],
 [[3, 3], :on_nl, "\n"]]
```

Each nested array in above output represents a single token. The structure of the array is as follows:

```
[[line number, text column], token name, characters]
```

The token name symbols in the output map to token types defined inside of the file “parse.y” of the ruby source code. Though the symbol names are not one to one with the C definition inside parse.y, the output of ripper captures what Ruby does internally as it encounters tokens. For instance “def” is mapped to :on_kw indicating that it is ruby keyword. Similarly “end” is also mapped to :on_kw. However inside of ruby “def” would be treated as the token of type “keyword_def”, and “end” would be treated as the token of type “keyword_end”. There are some other differences in the output of ripper and the internal representation of each token, but ripper gives us a good idea of how ruby tokenization works. It is important to remember that tokenization happens in a character by character streaming fashion. This gif should help visualize how a stream of characters is turned into a stream of tokens:


![Ruby tokenization in action](/images/the-structure-and-interpretation-of-ruby-programs-img-2.gif)

## Parsing

After ruby has finished converting the text of the program into a stream of tokens, the tokens are then grouped into logical units that ruby can understand. This is the parsing step, and it is at this step that the program is determined to be valid ruby or not. Ruby does this by determining if the stream of tokens conform the grammar rules defined in the parse.y file. If so, the stream of tokens are converted into a corresponding abstract syntax tree. The AST is a data structure representation of the syntactical meaning of your ruby program. The handy ripper tool can again help us visualize what this AST looks like to ruby, this time using the “sexp” function:

```ruby
require 'ripper'
require 'pp'
code = <<CODE
def add(x, y)
  x + y
end
CODE
pp Ripper.sexp(code)
```

Output:

```ruby
[:program,
 [[:def,
   [:@ident, "add", [1, 4]],
   [:paren,
    [:params,
     [[:@ident, "x", [1, 8]], [:@ident, "y", [1, 11]]],
     nil,
     nil,
     nil,
     nil,
     nil,
     nil]],
   [:bodystmt,
    [[:binary,
      [:var_ref, [:@ident, "x", [2, 2]]],
      :+,
      [:var_ref, [:@ident, "y", [2, 6]]]]],
    nil,
    nil,
    nil]]]]
```

This output is a bit terse, so I’ve included a visual reprsenation of the AST below. Each node in the tree represents a construct in the program. For instance, the addition of the identifier’s x and y is represented by a “binary” node. A binary node encodes an operation that performs on two elements of a set to derive a third element.


![The structure of the AST](/images/the-structure-and-interpretation-of-ruby-programs-img-3.webp)

The generated AST encapsulates everything ruby needs to understand your program, and with that, ruby can move on to the third and final step.

## Compilation

Ruby is a compiled language in much the same way that Java is. While ruby is not compiled down to native machine code, it is compiled into a set of bytecode instructions that are interpreted by a virtual machine. In the case of Java the VM is JVM, in the case of Ruby it is YARV, which stands for “Yet another ruby virtual-machine”.

In order to compile your program, ruby recursively iterates over the nodes in the AST from the top down and compiles each node into corresponding YARV instructions. Once more, we can use built in tools to examine how ruby compiles our AST into YARV instructions.

```ruby
code = <<CODE
def add(x, y)
  x + y
end
CODE
puts RubyVM::InstructionSequence.compile(code).disasm
```

Output:

```
== disasm: #@>================================
0000 trace            1                                               (   1)
0002 putspecialobject 1
0004 putobject        :add
0006 putiseq          add
0008 opt_send_without_block , 
0011 leave
== disasm: #>=======================================
local table (size: 2, argc: 2 [opts: 0, rest: -1, post: 0, block: -1, kw: -1@-1, kwrest: -1])
[ 2] x     [ 1] y
0000 trace            8                                               (   1)
0002 trace            1                                               (   2)
0004 getlocal_OP__WC__0 4
0006 getlocal_OP__WC__0 3
0008 opt_plus         , 
0011 trace            16                                              (   3)
0013 leave                                                            (   2)
```

YARV is a stack oriented virtual machine, so most of the instructions invlove putting an object onto the stack, and then executing an operation against the values on the stack. The top block of instructions are used to define the “add” method. Essentially the instructions put the method name on the stack, and then calls “define_method” a C function that is used by YARV to create a new ruby method. In the second block, a local table is defined which represent the arguments our function can accept.

## Conclusion

In this post we explored how ruby translates the text of a program, first into tokens, then into a structure called an AST, and finally into intstructions usable by the virtual machine. These three passes are what allow ruby to be interpreted by the virtual machine. Hopefully after reading this post you will have a little bit better understanding about what exactly happens when you boot up a ruby process.
