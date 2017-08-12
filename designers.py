import pandas as pd
pd.set_option('display.expand_frame_repr', False)
pd.set_option('display.max_columns', 10)

class Grailed(object):
    def __init__(self, feed_csv_path):
        self.df = self.load_df_from_csv(feed_csv_path)

    def load_df_from_csv(self, feed_csv_path):
        with open(feed_csv_path, 'r') as f:
            df = pd.read_csv(f, names=['title', 'designer', 'size', 'price', 'original_price', 'age'])
        
            # Remove dollar sign and convert to int
            df['price'] = df['price'].map(lambda price_str: int(price_str[1:]))
            df['original_price'] = df['original_price'].map(lambda price_str: int(price_str[1:]))
            df['designer'] = df['designer'].map(lambda designer_str: designer_str.lower())

        return df

    def get_designer_avg_price(self, designer_name, with_collabs=False):
        designer_name = self._clean_collab_name(designer_name)

        if with_collabs:
            designer_group = self.get_designer_group_with_collabs(designer_name)
        else:
            designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].mean()

    def get_designer_min_price(self, designer_name, with_collabs=False):
        designer_name = self._clean_collab_name(designer_name)

        if with_collabs:
            designer_group = self.get_designer_group_with_collabs(designer_name)
        else:
            designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].min()
    
    def get_designer_max_price(self, designer_name, with_collabs=False):
        designer_name = self._clean_collab_name(designer_name)

        if with_collabs:
            designer_group = self.get_designer_group_with_collabs(designer_name)
        else:
            designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].max()

    def get_designer_group(self, designer_name):
        designer_name = self._clean_collab_name(designer_name)

        groups = self.df.groupby('designer')

        return groups.get_group(designer_name)

    def combine_designer_with_collabs(self, designer_name):
        designer_name = self._clean_collab_name(designer_name)

        df = self.df.copy()

        def extract_collab_designer(designer):
            if designer_name in designer:
                return designer_name
            return designer

        self.df['designer'] = df['designer'].map(extract_collab_designer)

    def get_number_of_items_scraped(self):
        return self.df.shape[0]

    def get_number_of_items_marked_down(self):
        pass

    def _clean_collab_name(self,designer_name):
        # chr(215) is encoding for multiply sign '×', the character that Grailed uses to denote collaborations
        cleaned = [chr(215) if s == 'x' else s for s in designer_name.split(' ')]
        return ' '.join(cleaned)

    def summary(self, with_collabs=False):
        designers_to_groups = G.df.groupby('designer').indices
        non_collabs = list(filter(lambda name: chr(215) not in name, designers_to_groups))
        collabs = list(filter(lambda name: chr(215) in name, designers_to_groups))

        designers_with_collabs = { designer : [] for designer in non_collabs }

        for collab_name in collabs:
            for non_collab in non_collabs:
                if non_collab in collab_name:
                    designers_with_collabs[non_collab].append(collab_name)
        

        for designer_name in non_collabs:
            self.print_designer_summary(designer_name)

            if with_collabs:
                designer_collabs = designers_with_collabs[designer_name]
                for designer_collab in designer_collabs:
                    self.print_designer_summary(designer_collab)

    def print_designer_summary(self, designer_name):
            print("[%s]" % designer_name)
            print("  Average price: %0.2f" % G.get_designer_avg_price(designer_name))
            print("  Max price: %0.2f" % G.get_designer_max_price(designer_name))
            print("  Min price: %0.2f" % G.get_designer_min_price(designer_name))
            print("  Total items: %d" % len(G.get_designer_group(designer_name)))
            print()

G = Grailed('./feed_items.csv')





