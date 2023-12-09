+++
author = "Nassredean Nasseri"
title = "Plotting Text with an AxiDraw"
date = "2023-12-09"
description = "A guide on how to plot text using a pen plotter like the AxiDraw."
tags = [
    "pen plotter",
]
categories = [
    "creative coding",
    "generative design",
    "pen plotter",
]
+++

## The Context
I’ve been learning how to mix drinks, and since I always forget the recipes, I thought it might be neat to have a handy little cocktail menu and guide in my bar for a few of the more common drinks (and importantly, the ones I am stocked to prepare).

I have an ongoing chat with ChatGPT 4 called “Bar Talk”. In it I ask questions relating to cocktails, mixology and other bar craft. I find myself often in this chat while at bar or restaurant. I use it to decide what to drink, choose the particular spirit to use amongst the available options, and generate recipes for cocktails that I like. It’s been a neat, conversational way to learn more about mixology, which I’ve always appreciated from a distance.

I decided to use this ongoing chat as a data source, and prompted ChatGPT to summarize the recipes mentioned in the previous conversation for me.

![Screenshot of the "Bar Talk" ChatGPT conversation](/images/plotting-text/gpt-convo.png)

With some additional prompting, I was able to curate a set of cocktails and collate them in GoogleDocs, with some halfway decent formatting. At this point, I could have printed the recipes, stapled them together, and called it a day. But I have never tried plotting text, and I was looking for a reason to try it.

## Plotting Text
For the uninitiated, pen plotters draw lines on paper using an actual pen (or paint brush or anything else you want to mount). They are basically a two-axis 3D printer whose XY position can be controlled programmatically. I have the AxiDraw A3, so I can print rather large. In this case, I will be working with an 11*17 inch canvas.

When working with the AxiDraw pen plotters, Inkscape has great tooling support. But typically, I use the axicli command line utility to control my plotter, so I could design the graphic in any software that produces SVG files. Nonetheless, Inkscape is my preferred vector graphics editor, and it does have great support for working with “engraving fonts”, sometimes also called “stroke fonts”, which we are going to need.

Most modern font systems (truetype, postscript, opentype, etc.) are examples of outline fonts. In these, the font file describes a filled vector shape, and when you try to pen plot them, you get a result like this:

![Example of a ttf font plotted with the AxiDraw](/images/plotting-text/IMG_0443.JPG)

The pen plotter simply did what it was told and followed the outline of each font character. The result doesn’t look great. At first I tried combining a thicker pen with a smaller font size, to see what I would get:

![Example of a ttf font plotted with thicker pen AxiDraw](/images/plotting-text/IMG_0445.JPG)

Not so great either. You can imagine that trying to dial in the writing instrument thickness, the distance of the drawing instrument from the canvas (and thus the pressure applied to the nib), the font size, and the font is simply too many variables.

There is an alternative, and that's where engraving fonts, sometimes also called stroke fonts, come in. These fonts are composed of single strokes and do not produce outlines. The best way to use stroke fonts in Inkscape is via the extension 
[HersheyText](https://wiki.evilmadscientist.com/Hershey_Text). [As  of Inkscape 1.0](https://www.evilmadscientist.com/2019/hershey-text-v30/), HersheyText is included in Inkscape. There is a [comprehensive user guide](https://cdn.evilmadscientist.com/dl/ad/public/HersheyText_v30r5.pdf) for getting up and running with HersheyText. 

A number of fonts are included by default in the HersheyText extension, but a more complete set can be found [here](https://gitlab.com/oskay/svg-fonts). I had a little trouble finding where to add the fonts on my Mac. The documentation mentions the `svg_fonts` directory in the extensions directory. Initially I checked

```
/Users/me/Library/Application Support/org.inkscape.Inkscape/config/inkscape/extensions/svg_fonts
```

But had no luck adding it there. [A comment on a random issue on github](https://github.com/inkstitch/inkstitch/issues/562#issuecomment-663301202) made me think to check the resources directory of the app, and after moving the fonts to

```
/Applications/Inkscape.app/Contents/Resources/share/inkscape/extensions/svg_fonts
```

I was able to load the custom fonts by marking “other” in the HersheyText dropdown and using the name of the font file in the text box, without the file extension specified. I think this directory may get wiped out with each installation of Inkscape, which is something to be aware of.

![Screenshot of the hershey text tool in inkscape](/images/plotting-text/hershey-text.png)

Here were the results of my tests:

![Plotted text](/images/plotting-text/IMG_0451.JPG)

![More Plotted text](/images/plotting-text/IMG_0447.JPG)
