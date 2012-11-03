
# this is the gui part, thus, being translated.

from towel.communication import JsonSignal


f = JsonSignal('test')

f(1, foo='bar')



print "openening JSON"
