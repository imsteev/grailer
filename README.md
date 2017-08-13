# grailer

## What is this?
Grailer is a project that allows a user to scrape data from [Grailed](https://grailed.com). Grailed is an after-retail marketplace for
users to purchase & sell fashion items.

__Disclaimer: None of the data being scraped using this tool should be used for commercial purposes. This project is motivated entirely by my personal interest in both fashion and technology.__

## Motivation
To my knowledge, Grailed currently does not offer a public API yet.

## How to Use
Install CasperJS and add the binary to your PATH.

CasperJS is built on top of [PhantomJS](https://phantomjs.org), so it comes included with a command-line interface. To help scrape the data you actually want, the script accepts some options that help leverage the filtering engine on Grailed's site.

```
capserjs ./index.js [--OPTIONS]

# key-value options
--numItems # number of items you want the script to scrape
--designers # comma separated list of designers to filter
--markets # grails, hype, core (choose a combination)
--sort # default, new, popular, high, low (choose one)
```
### How exactly is the data being scraped?
TODO

### Reasoning for browser automation
We need to use a tool like CasperJS to scrape a website like Grailed. This is because the content on the site is generated dynamically on the client side (Grailed uses [ReactJS](https://facebook.github.io/react/)) - thus, we cannot just make a request to a certain endpoint and get a complete HTML file in response. Instead, we need something that acts like a Grailed user so that all the HTML can be generated as if it were being run in a browser.

## Technologies used
  - [Grailed Website](https://grailed.com)
  - [CasperJS](http://casperjs.org/) for browser automation
  - [Pandas](http://pandas.pydata.org/) for basic analysis on datasets
  - [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) for HTML parsing
