import sys
import csv
import pandas as pd

from bs4 import BeautifulSoup

class FeedParser(object):
    def __init__(self, html_path, csv_dest):
        self.feed_html = None
        self.soup = None
        self.dest = csv_dest
        self.load_feed_html(html_path)

    def load_feed_html(self, html_path):
        with open(html_path, 'r') as html:
            self.feed_html = html
            self.soup = BeautifulSoup(html, 'lxml')
    
    def get_feed_items(self):
        if self.soup is None:
            print("no soup available")
            return
        return self.soup.find_all('div', {'class': 'feed-item'})

    def create_csv(self):
        fields_to_write = ['title', 'designer', 'size', 'price', 'original_price', 'age', 'bumped']

        with open(csv_dest, 'w') as csvfile:
            writer = csv.writer(csvfile)

            for feed_item_html in self.get_feed_items():
                if 'empty-item' not in feed_item_html.attrs['class']:
                    try:
                        item = self.extract_feed_item_fields(feed_item_html)
                        writer.writerow([item[field_name] for field_name in fields_to_write])
                    except:
                        print("Something wrong happened writing data")
    
    def extract_feed_item_fields(self, feed_item_html):
        result = {}
        f = feed_item_html

        listing_age = f.select('h3 > .date-ago')
        origin = f.find('span', 'strike-through')

        if len(listing_age) == 2:
            result['age'] = listing_age[1].find('span', 'strike-through').text
            result['bumped'] = listing_age[0].text
        else:
            result['age'] = listing_age[0].text
            result['bumped'] = None

        result['designer'] = f.find('h3', 'listing-designer').text
        result['size'] = f.find('h3', 'listing-size').text
        result['title'] = f.find('h3', 'listing-title').text

        marked_down = f.find('h3', 'new-price') is not None
        result['original_price'] = f.find('h3', 'original-price').text
        result['price'] = f.find('h3', 'new-price').text if marked_down else result['original_price']

        return result

if __name__ == '__main__':
    feed_html = './feed.html'
    csv_dest = './feed.csv'

    for arg in sys.argv:
        if arg.endswith('.html'):
            feed_html = arg
        elif arg.endswith('.csv'):
            csv_dest = arg

    dp = FeedParser(feed_html, csv_dest)
    dp.create_csv()