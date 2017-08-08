import pandas as pd

class Grailed(object):
    def __init__(self, feed_csv_path):
        self.df = None
        with open(feed_csv_path, 'r') as f:
            self.df = pd.read_csv(f, names=['title', 'designer', 'size', 'price', 'original_price', 'new_price', 'age'])
        
        # Remove dollar sign and convert to int
        self.df['price'] = self.df['price'].map(lambda price_str: int(price_str[1:]))
        self.df['designer'] = self.df['designer'].map(lambda designer_str: designer_str.lower())

    def get_designer_avg_price(self, designer_name, group=None):
        designer_group = self.get_designer_group(designer_name)

        if group is not None:
            designer_group = group

        return designer_group['price'].mean()

    def get_designer_min_price(self, designer_name, group=None):
        designer_group = self.get_designer_group(designer_name)
        
        if group is not None:
            designer_group = group

        return designer_group['price'].min()
    
    def get_designer_max_price(self, designer_name, group=None):
        designer_group = self.get_designer_group(designer_name)
        
        if group is not None:
            designer_group = group

        return designer_group['price'].max()

    def get_designer_group(self, designer_name):
        groups = self.df.groupby('designer')

        return groups.get_group(designer_name)

    def get_designer_group_with_collabs(self, designer_name):
        df = self.df.copy()

        def extract_collab_designer(designer):
            if designer_name in designer:
                return designer_name
            return designer

        df['designer'].map(extract_collab_designer)

        return df.groupby('designer').get_group(designer_name)

G = Grailed('./feed_items.csv')

# designer_to_group = G.df.groupby('designer').indices
# for designer_name in designer_to_group:
#     print("%s : %0.2f" % (designer_name, G.get_designer_avg_price(designer_name)))

print("Total items scraped: %d" % G.df.shape[0])
print("Average price of all items scraped: $%0.2f" % G.df['price'].mean())

class designerSummary(object):
    pass






