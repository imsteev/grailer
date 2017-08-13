class DesignerSummary(object):
    def __init__(self, designer_name, summary):
        self.designer_name = designer_name
        self.summary = summary
    
    def print_summary(self):
        print("[%s]" % self.designer_name)
        print("  %s" % self.max_price())
        print("  %s" % self.avg_price())
        print("  %s" % self.min_price())
        print("  %s" % self.total_items())
        print("  %s" % self.avg_age_of_listing())
        print("  %s" % self.avg_age_bumped())
        print("  %s" % self.items_marked_down())
        print("  %s" % self.items_bumped())

        if 'num_collabs' in self.summary:
            print("  %s" % self.num_collabs())
        
        print()
    
    def max_price(self):
        return "Max price: $%0.2f" % self.summary['max_price']
    
    def avg_price(self):
        return "Avg price: $%0.2f" % self.summary['avg_price']
    
    def min_price(self):
        return "Min price: $%0.2f" % self.summary['min_price']
    
    def total_items(self):
        return "Total items: %d" % self.summary['num_items']
    
    def avg_age_of_listing(self):
        return "Avg age of listing: %0.2f days" % self.summary['avg_age'] 
    
    def avg_age_bumped(self):
        return "Avg age bumped: %0.2f days" % self.summary['avg_age_bumped']
    
    def items_marked_down(self):
        return "Items marked down: %d (%0.2f %%)" % (self.summary['num_marked_down'], self.summary['per_marked_down'])
    
    def items_bumped(self):
        return "Items bumped: %d (%0.2f %%)" % (self.summary['num_bumped'], self.summary['per_bumped'])

    def num_collabs(self):
        return "Collaborations: %d" % self.summary['num_collabs']
