


print "Hello World!{}, {}".format('a', 'b')
print "Hello World!{1}, {0}".format('a', 'b')



#print "Hello World!{}, {0}".format('a', 'b') # ValueError: cannot switch from manual field specification to automatic field numbering
#print "Hello World!{1}, {}".format('a', 'b') # ValueError: cannot switch from manual field specification to automatic field numbering


print "Hello World!{},".format('a', 'b') # too few
print "Hello World!{}, {}, {}".format('a', 'b') # too many :: IndexError: tuple index out of range

print "Hello World! {name}({}) : {}".format('a', 'c', name='b') # mix
### Kwargs
print "Hello World! {name}({age})".format(name='dexter', age=22) 
print "Hello World! {name}({age})".format(name='dexter', age=22, location='trein')  # extra arguments
#print "Hello World! {name}({age}: {location})".format(name='dexter', age=22) # too few arguments :: KeyError: 'location'

#print "Hello World! {name}({age}: {location})".format('dexter', 22, 'train') # not named KeyError: 'name'
