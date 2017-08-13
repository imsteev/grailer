import pandas as pd
pd.set_option('display.expand_frame_repr', False)
pd.set_option('display.max_columns', 10)

class Grailed(object):
    def __init__(self, feed_csv_path):
        self.df = self.load_df_from_csv(feed_csv_path)
        self.groups = self.df.groupby('designer')

        designers_to_groups = self.groups.indices
        self.non_collabs = [name for name in designers_to_groups if not self.is_collab(name)]
        self.collabs = [name for name in designers_to_groups if self.is_collab(name)]

        self.designers_with_collabs = { designer : [] for designer in self.non_collabs }

        for collab_name in self.collabs:
            for non_collab in self.non_collabs:
                if non_collab in collab_name:
                    self.designers_with_collabs[non_collab].append(collab_name)

    def load_df_from_csv(self, feed_csv_path):
        with open(feed_csv_path, 'r') as f:
            df = pd.read_csv(f, names=['title', 'designer', 'size', 'price', 'original_price', 'age', 'bumped'])
        
        # Remove dollar sign and convert to int
        df['price'] = df['price'].map(lambda price_str: int(price_str[1:]))
        df['original_price'] = df['original_price'].map(lambda price_str: int(price_str[1:]))
        df['designer'] = df['designer'].map(lambda designer_str: designer_str.lower())
        
        def string_to_seconds(time_desc):
            time_denoms = {
                'second' : 1 / 24 / 60 / 60, 
                'minute': 1 / 24 / 60, 
                'hour': 1 / 24,
                'day' : 1,
                'week': 7,
                'month': 30,
                'year': 365
            }

            time_denoms['min'] = time_denoms['minute']

            desc = time_desc.split(' ')
            num, denom = desc[0], desc[1]

            if denom[-1] == 's':
                denom = denom[:len(denom)-1]

            return int(num) * time_denoms[denom]

        df['age'] = df['age'].map(string_to_seconds)
        df['bumped'] = df['bumped'].map(lambda b: b if pd.isnull(b) else string_to_seconds(b))

        
        return df

    def get_designer_avg_price(self, designer_name):
        designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].mean()

    def get_designer_min_price(self, designer_name):
        designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].min()
    
    def get_designer_max_price(self, designer_name):
        designer_group = self.get_designer_group(designer_name)

        return designer_group['price'].max()

    def get_designer_group(self, designer_name):
        designer_name = self._clean_collab_name(designer_name)

        return self.groups.get_group(designer_name)

    def get_designer_avg_age(self,designer_name):
        designer_group = self.get_designer_group(designer_name)

        return designer_group['age'].mean()

    def get_designer_avg_bumped(self,designer_name):
        designer_group = self.get_designer_group(designer_name)

        return designer_group['bumped'].mean()

    def combine_designer_with_collabs(self, designer_name):
        designer_name = self._clean_collab_name(designer_name)

        df = self.df.copy()

        def extract_collab_designer(designer):
            if designer_name in designer:
                return designer_name
            return designer

        self.df['designer'] = df['designer'].map(extract_collab_designer)

    def get_num_marked_down(self, designer_name):
        designer_group = self.get_designer_group(designer_name)

        return len(designer_group[designer_group['price'] != designer_group['original_price']])

    def is_collab(self,designer_name):
        return chr(215) in designer_name

    def designer_summary(self, designer_name):
        summary = { 
            'max_price': G.get_designer_max_price(designer_name),
            'avg_price': G.get_designer_avg_price(designer_name),
            'min_price': G.get_designer_min_price(designer_name),
            'num_items': len(G.get_designer_group(designer_name)),
            'num_marked_down': G.get_num_marked_down(designer_name),
            'avg_age': G.get_designer_avg_age(designer_name),
            'bumped': G.get_designer_avg_bumped(designer_name)
        }
        summary['per_marked_down'] = 100 * summary['num_marked_down'] / summary['num_items']

        if not self.is_collab(designer_name):
            summary['num_collabs'] = len(self.designers_with_collabs[designer_name])

        return summary

    def print_summary(self, with_collabs=False):        
        for designer_name in self.non_collabs:
            self.print_designer_summary(designer_name)

            if with_collabs:
                for designer_collab in self.designers_with_collabs[designer_name]:
                    self.print_designer_summary(designer_collab)

    def print_designer_summary(self, designer_name):
        summary = self.designer_summary(designer_name)

        print("[%s]" % designer_name)
        print("  Max price: $%0.2f" % summary['max_price'])
        print("  Avg price: $%0.2f" % summary['avg_price'])
        print("  Min price: $%0.2f" % summary['min_price'])
        print("  Total items: %d" % summary['num_items'])
        print("  Items marked down: %d (%0.2f %%)" % (summary['num_marked_down'], summary['per_marked_down']))
        print("  Avg age of listing: %0.2f days " % summary['avg_age'])

        if 'num_collabs' in summary:
            print("  Collaborations: %d" % summary['num_collabs'])
        
        print()
        
    def _clean_collab_name(self,designer_name):
        # chr(215) is encoding for multiply sign '×', the character that Grailed uses to denote collaborations
        cleaned = [chr(215) if s == 'x' else s for s in designer_name.split(' ')]
        return ' '.join(cleaned)

G = Grailed('./feed_items.csv')





