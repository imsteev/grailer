import pandas as pd

class Grailed(object):
    def __init__(self, feed_csv_path):
        self.df = None

        with open(feed_csv_path, 'r') as f:
            self.df = pd.read_csv(f, names=['title', 'designer', 'size', 'price', 'age'])
        
        # Remove dollar sign and convert to int
        self.df['price'] = self.df['price'].map(lambda price_str: int(price_str[1:]))
        self.df['designer'] = self.df['designer'].map(lambda designer_str: designer_str.lower())

    def get_brand_avg_price(self, brand_name, group=None):
        brand_group = self.get_brand_group(brand_name)

        if group is not None:
            brand_group = group

        return brand_group['price'].mean()

    def get_brand_min_price(self, brand_name, group=None):
        brand_group = self.get_brand_group(brand_name)
        
        if group is not None:
            brand_group = group

        return brand_group['price'].min()
    
    def get_brand_max_price(self, brand_name, group=None):
        brand_group = self.get_brand_group(brand_name)
        
        if group is not None:
            brand_group = group

        return brand_group['price'].max()

    def get_brand_group(self, brand_name):
        groups = self.df.groupby('designer')

        return groups.get_group(brand_name)

    def get_brand_group_with_collabs(self, brand_name):
        df = self.df.copy()

        def extract_collab_brand(brand):
            if brand_name in brand:
                return brand_name
            return brand

        df['designer'].map(extract_collab_brand)

        return df.groupby('designer').get_group(brand_name)

G = Grailed('./feed_items.csv')

brand_to_group = G.df.groupby('designer').indices
for brand_name in brand_to_group:
    print("%s : %0.2f" % (brand_name, G.get_brand_avg_price(brand_name)))

class BrandSummary(object):
    pass






