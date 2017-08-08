import csv
import pandas as pd
from bs4 import BeautifulSoup

class FeedParser(object):
    def __init__(self, html_path):
        self.feed_html = None
        self.soup = None
        
        self.load_feed_html(html_path)

    def load_feed_html(self, html_path):
        with open(html_path, 'r') as html:
            self.feed_html = html
            self.soup = BeautifulSoup(html, 'lxml')
    
    def get_feed_items(self):
        if self.soup is None:
            print("no soup available")
            return
        return self.soup.find_all('div', 'feed-item')

    def create_csv(self):
        fields_to_write = ['title', 'designer', 'size', 'price', 'original_price', 'age']

        with open('feed_items.csv', 'w') as csvfile:
            writer = csv.writer(csvfile)

            for feed_item_html in self.get_feed_items():
                try:
                    item = self.extract_feed_item_fields(feed_item_html)
                    writer.writerow(map(lambda field_name: item[field_name], fields_to_write))
                except:
                    print("Something wrong happened writing data")
    
    def extract_feed_item_fields(self, feed_item_html):
        result = {}
        f = feed_item_html

        result['age'] = f.find('h3', 'listing-age').text
        result['designer'] = f.find('h3', 'listing-designer').text
        result['size'] = f.find('h3', 'listing-size').text
        result['title'] = f.find('h3', 'listing-title').text

        marked_down = f.find('h3', 'new-price') is not None
        result['original_price'] = f.find('h3', 'original-price').text
        result['price'] = f.find('h3', 'new-price').text if marked_down else result['original_price']

        return result

# Move this out to a main python file   
dp = FeedParser('./feed.html')

dp.create_csv()
