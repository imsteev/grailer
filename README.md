# grailer

## What is this?
Grailer is a project that allows a user to get information from [Grailed](https://grailed.com). It provides users to scrape, parse, and do some simple analysis on items being sold on the site. 

__Disclaimer: None of the data being scraped using this tool should be used for commercial reasons__

## Motivation
  1. This project bridges a gap between two of my interests in fashion and technology
  2. To my knowledge, Grailed currently does not offer a public API yet - it'd be cool to see more sophisticated analysis
     on what the market on Grailed looks like

## Prerequisites
Install CasperJS and add the binary to your PATH. For parsing and analysis, I recommend using `pip3` to install Pandas and BeautifulSoup4.

There are three files to be aware of:

  - `index.js` is responsible for the browser automation and scraping. At the end of the job, it will write the item feed's html to a file.
  - `parse.py` parses and extracts the following fields for each field item and saves those results in CSV format:
      - __price, original price, age, bumped age, listing title, designer, size__
  - `designers.py` is my attempt at doing some analysis with the CSV generated from the scrape & parse flow. Dive into the source code of that file to see what methods may fit your needs. An example output of the `summary` method looks like this:
```
python3 -i designers.py
>>> G.summary()
[supreme]
  Max price: $12500.00
  Avg price: $245.08
  Min price: $100.00
  Total items: 19011
  Avg age of listing: 106.89 days
  Avg age bumped: 30.31 days
  Items marked down: 8754 (46.05 %)
  Items bumped: 11521 (60.60 %)
  Collaborations: 134
```

## How to use
CasperJS is built on top of [PhantomJS](https://phantomjs.org), so it comes included with a command-line interface. To help narrow down the data you actaully care about, the script accepts some command-line options that help leverage the filtering engine on Grailed's site.

```
--numItems # number of items you want the script to scrape
--designers # comma separated list of designers to filter (if left out, will search what is shown by default)
--markets # grails, hype, core (if left out, will search all three)
--sort # default, new, popular, high, low (choose one)
```
Example usage:
```
casperjs ./index.js --designers='off-white, vetements' sort=high --numItems=500
```

### How does the scrape work?
If you take some time to get familiar with Grailed's website, you'll see that the main page has a central feed of items.
This area is "infinitely" scrollable, with more items being fetched and loaded as you scroll further down. In general, one scroll loads 40 items. This brings us to a fairly simple approach with CasperJS: while the number of items currently loaded don't meet your expectations, keep scrolling down!

### Reasoning for browser automation
The content on Grailed is generated dynamically on the client side (they use [ReactJS](https://facebook.github.io/react/)) - thus, we cannot just make a request to a certain endpoint and get a complete HTML file in response. Instead, we need something that acts like a browser so that all the HTML can be generated as if it were a user clicking and scrolling the site.

### Parallelization (for fun!)
Scraping data can be time consuming. In context of Grailed's site, scraping with certain filters and queries may not make the most sense in terms of what you really want. For example, if you want to scrape data about the designers "vetements", "bape", and "off-white", configuring your search to query "vetements, bape, off-white", the items in your feed may not (and probably will not) have an even distribution. It probably makes more sense to scrape each designer separately.

More importantly, the filter configuration and the fact that the feed is lazily loaded introduces significant blocking time meant for ensuring that pages are fully loaded after a click or scroll - this adds up if done sequentially. We can improve this by using a tool like [GNU Parallel](https://www.gnu.org/software/parallel/parallel_tutorial.html) to scrape in parallel: one job for one designer.

```
# Sequential scrape
time (casperjs ./index.js --numItems=500 --designers='off-white'; casperjs ./index.js --numItems=500 --designers='vetements'; casperjs ./index.js --numItems=500 --designers='bape')

real	1m43.500s
user	0m40.379s
sys	0m6.717s

# Parallel scrape
time (echo --designers="vetements"; echo --designers="off-white"; echo --designers='bape') | parallel -j+0 --verbose casperjs ./index.js --sort=high --numItems=500

real	0m43.181s
user	0m46.652s
sys	0m10.294s
```

## Technologies used
  - [Grailed Website](https://grailed.com)
  - [CasperJS](http://casperjs.org/) for browser automation
  - [Pandas](http://pandas.pydata.org/) for basic analysis on datasets
  - [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) for HTML parsing
  - [Parallel](https://www.gnu.org/software/parallel/parallel_tutorial.html) (optional)
