"""
Templates is a package which can render 'linked' html.
linked html is html which is linked with data. 
for example:
    a list can be iterated over, each element in the list is represented as a html domnode
    linked html makes sure that when an element is added to the list. a domnode is added as well.
    
    
The procedure
The user defines a directive. a mapping between the data in the object and an html template
the directive 

"""


print "loading Templates"

from towel.templates.node import DOMNode
from towel.templates.widget import Widget
