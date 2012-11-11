
/* 01-strict-mode.js             */
"use strict";

/* 05-init.js                    */
var $PY = {
    available_modules : {},
    loaded_modules : {}
};
$PY.load_lazy = undefined;
$PY.add_module = function (name, filename, module_body) {
    if (name === "__main__") {
        var mod = module(name, filename);
        window.addEventListener("load", function () {
            module_body(mod);
        });
    } else {
        $PY.available_modules[name] = {
            name: name,
            filename : filename,
            body: module_body
        }
    }
};
$PY.prng = 42;
var __builtins__ = {};
__builtins__.PY$__python3__ = false;
function prng() {
    $PY.prng = ($PY.prng * 0x8088405 + 1) % 0xFFFFFFFF;
    return $PY.prng;
}
function bt() {
    try {
        null();
    } catch (x) {
        __builtins__.PY$print(x.stack);
    }
}
function iterate(obj, func) {
    if (obj.PY$__class__ === undefined) {
        for (var i in obj) {
            func(obj[i]);
        };
    } else if (obj.PY$__class__ === list || obj.PY$__class__ === tuple) {
        for (var i = 0; i < obj.items.length; i++) {
            func(obj.items[i]);
        };
    } else {
        var seq = iter(obj);
        while (true) {
            try {
                func(seq.PY$next());
            } catch (exc) {
                if (exc === $PY.c_stopiter || $PY.isinstance(exc, __builtins__.PY$StopIteration)) {
                    break;
                } else {
                    throw exc;
                }
            }
        }
    }
}
var __kwargs_make = function(kw, kwargs) {
    kw.__kwargs = true;
    if (kwargs !== undefined) {
        if (kwargs.PY$__class__ !== dict) {
            throw TypeError("Keyword arguments with non-standard dictionary types not supported");
        }
        var items = kwargs.items;
        for (var i = 0; i < items.length; i += 2) {
            kw[str(items[i])._js_()] = items[i+1];
        };
    };
    return kw;
};
var __varargs_make = function(vr) {
    vr = tuple(vr);
    vr.__varargs = true;
    return vr;
};
var __varargs_get = function(args) {
    if (args.length && (args[args.length-1] !== undefined) && (args[args.length-1].__varargs === true)) {
        var vargs = args[args.length-1];
        args.length -= 1;
        return vargs;
    } else {
        return $PY.$c_emptytuple;
    }
};
var __kwargs_get = function(args) {
    if (args.length && (args[args.length-1] !== undefined) && (args[args.length-1].__kwargs === true)) {
        delete args[args.length-1].__kwargs;
        var res = args[args.length-1];
        delete args[args.length-1];
        args.length -= 1;
        return res;
    } else {
        return [];
    }
};
var js = function(obj) {
    if ((obj != null) && obj._js_ !== undefined)
        return obj._js_();
    else
        return obj;
};
var py = function(obj) {
    if (obj && obj.PY$__class__ !== undefined) {
        return obj;
    } else if (typeof obj === 'number') {
        return int(obj);
    } else if (typeof obj === 'string') {
        return str(obj);
    } else if (typeof obj === 'boolean') {
        return bool(obj);
    } else if (obj === undefined || obj === null) {
        return None;
    } else if (obj instanceof Array) {
        var res = list();
        for (var q in obj) {
          res.PY$append(py(obj[q]));
        }
        return res;
    } else {
        var res = dict();
        for (var q in obj) {
            res.PY$__setitem__(str(q), py(obj[q]));
        }
        return res;
    }
};

/* 06-pyjaco.js                  */
$PY.isinstance = function(obj, cls) {
    if (cls instanceof Array) {
        for (var i = 0; i < cls.length; i++) {
            var c = obj.PY$__class__;
            while (c) {
                if (c === cls[i])
                    return true;
                c = c.PY$__super__;
            }
        }
        return false;
    } else {
        var c = obj.PY$__class__;
        while (c) {
            if (c === cls)
                return true;
            c = c.PY$__super__;
        }
        return false;
    }
};
$PY.repr = function(obj) {
    return __builtins__.PY$repr(obj)._js_();
};
$PY.dump = function(obj) {
    var res = [];
    for (var i in obj) {
        var val = obj[i];
        if (typeof val === 'function') {
            res.push(i + " (function)");
        } else if (typeof val === 'number') {
            res.push(i + " (number: " + val + ")");
        } else if (typeof val === 'string') {
            res.push(i + " (string: " + val + ")");
        } else if (val === null) {
            res.push(i + " (null)");
        } else if (val === undefined) {
            res.push(i + " (undefined)");
        } else {
            res.push(i + " (object)");
        }
    }
    res.sort();
    return "[\n  " + res.join("\n  ") + "\n]";
};
$PY.len = function(obj) {
    var c = obj.PY$__class__;
    if (c === list || c === tuple || c === str || c === basestring || c === unicode) {
        return obj.obj.length;
    } else if (obj.PY$__len__ !== undefined) {
        return obj.PY$__len__()._js_();
    } else {
        throw __builtins__.PY$AttributeError('__len__');
    }
};
$PY.next = function(obj) {
    if (obj.PY$__class__ === iter) {
        return obj.next();
    } else {
        try {
            return obj.PY$next();
        } catch (x) {
            if (x === $PY.c_stopiter || $PY.isinstance(x, __builtins__.PY$StopIteration)) {
                return null;
            } else {
                throw x;
            }
       }
    }
};
$PY.__not__ = function(obj) {
   if (obj.PY$__nonzero__ !== undefined) {
       return js(obj.PY$__nonzero__()) ? False : True;
   } else if (obj.PY$__len__ !== undefined) {
       return js(obj.PY$__len__()) === 0 ? True : False;
   } else {
       return js(obj) ? False : True;
   }
};
$PY.__is__ = function(a, b) {
    return a === b ? True : False;
};
$PY.c_nif = function() {
    throw __builtins__.PY$NotImplementedError("The called function is not implemented in Pyjaco");
}

/* 10-builtin.js                 */
__builtins__.js_getattr = function(obj, name, value) {
    var val = obj[name];
    if (val !== undefined) {
        return val;
    } else {
        if (value !== undefined) {
            return value;
        } else {
            throw __builtins__.PY$AttributeError("Object " + js(str(obj)) + " does not have attribute " + name);
        }
    }
};
__builtins__.js_setattr = function(obj, name, value) {
    obj[name] = value;
};
__builtins__.PY$abs = function(obj) {
    if (obj === undefined) {
        throw __builtins__.PY$TypeError("abs() takes exactly one argument (" + arguments.length + " given)");
    } else if (obj.PY$__abs__) {
        return obj.PY$__abs__();
    } else {
        throw __builtins__.PY$TypeError("bad operand type for abs(): '" + obj.PY$__class__.PY$__name__ + "'");
    }
};
__builtins__.PY$all = function(obj) {
    if (obj === undefined) {
        throw __builtins__.PY$TypeError("all() takes exactly one argument (" + arguments.length + " given)");
    }
    var item;
    var bool = __builtins__.PY$bool;
    for (var it = iter(obj); item = $PY.next(it); item !== null) {
        if (bool(item) !== True) {
            return False;
        }
    }
    return True;
};
__builtins__.PY$any = function(obj) {
    if (obj === undefined) {
        throw __builtins__.PY$TypeError("any() takes exactly one argument (" + arguments.length + " given)");
    }
    var item;
    var bool = __builtins__.PY$bool;
    for (var it = iter(obj); item = $PY.next(it); item !== null) {
        if (bool(item) === True) {
            return True;
        }
    }
    return False;
};
__builtins__.PY$apply = function(fun, vargs, kwargs) {
    if (vargs === undefined) {
        return fun();
    } else {
        if (kwargs === undefined) {
            return fun(__varargs_make(vargs));
        } else {
            return fun(__varargs_make(vargs), __kwargs_make(kwargs));
        }
    }
};
__builtins__.PY$bin = function(num) {
    if (num.PY$__class__ === __builtins__.PY$int) {
        var bin = num._js_().toString(2);
        if (bin.charAt(0) === "-") {
            return __builtins__.PY$str("-0b" + bin.substr(1));
        } else {
            return __builtins__.PY$str("0b" + bin);
        }
    } else {
        throw __builtins__.PY$TypeError("'" + num.PY$__class__.PY$__name__ + "' object cannot be interpreted as an index");
    }
};
__builtins__.PY$buffer = $PY.c_nif;
__builtins__.PY$bytearray = $PY.c_nif;
__builtins__.PY$bytes = $PY.c_nif;
__builtins__.PY$callable = function(obj) {
    if (typeof obj === "function" && obj.PY$__class__ === undefined) {
        return True;
    } else {
        return __builtins__.PY$hasattr(obj, "__call__");
    }
};
__builtins__.PY$chr = function(chr) {
    var s = String.fromCharCode(chr._js_());
    if (s === "\0") {
        throw __builtins__.PY$TypeError("an integer is required");
    } else {
        return __builtins__.PY$str(s);
    }
};
__builtins__.PY$classmethod = $PY.c_nif;
__builtins__.PY$cmp = function(x, y) {
    return x.PY$__cmp__(y);
};
__builtins__.PY$coerce = function(a, b) {
    var _int = __builtins__.PY$int;
    var _float = __builtins__.PY$float;
    var _tuple = __builtins__.PY$tuple;
    if (a.PY$__class__ === _int) {
        if (b.PY$__class__ === _int) {
            return tuple([a, b]);
        } else if (b.PY$__class__ === _float) {
            return tuple([_float(a), _float(b)]);
        } else {
            throw __builtins__.PY$TypeError("number coercion failed");
        }
    } else if (a.PY$__class__ === _float) {
        return tuple([_float(a), _float(b)]);
    } else {
        throw __builtins__.PY$TypeError("number coercion failed");
    }
};
__builtins__.PY$compile = $PY.c_nif;
__builtins__.PY$complex = $PY.c_nif;
__builtins__.PY$copyright = __builtins__.PY$license;
__builtins__.PY$credits = "The Pyjaco authors would like to thank everybody who has contributed" +
    "time, ideas, or patches to the Pyjaco project.";
__builtins__.PY$delattr = function(obj, name) {
    name = js(name);
    if (obj["PY$" + name] !== undefined) {
        delete obj["PY$" + name];
    } else {
        throw __builtins__.PY$AttributeError("Object " + js(str(obj)) + " does not have attribute " + name);
    }
};
__builtins__.PY$dir = function(obj) {
    var res = list();
    for (var i in obj) {
        if (i.indexOf('PY$') === 0) {
            res.PY$append(__builtins__.PY$str(i.substr(3)));
        }
    }
    res.PY$sort();
    return res;
};
__builtins__.PY$divmod = $PY.c_nif;
__builtins__.PY$enumerate = function(obj) {
    if (arguments.length != 1) {
        throw __builtins__.PY$NotImplementedError("enumerate() only supports 1 argument");
    }
    var items = list();
    var count = 0;
    iterate(obj, function(elm) {
                items.PY$append(tuple([count++, elm]));
            });
    return items;
};
__builtins__.PY$eval = $PY.c_nif;
__builtins__.PY$execfile = $PY.c_nif;
__builtins__.PY$exit = $PY.c_nif;
__builtins__.PY$file = $PY.c_nif;
__builtins__.PY$filter = function(f, l) {
   var res = list();
   iterate(l, function(item) {
     if (f(item) === True) {
       res.PY$append(item);
     }
   });
   return res;
};
__builtins__.PY$format = $PY.c_nif;
__builtins__.PY$frozenset = $PY.c_nif;
__builtins__.PY$getattr = function(obj, name, value) {
    name = js(name);
    var val = obj["PY$" + name];
    if (val !== undefined) {
        return val;
    } else {
        if (value !== undefined) {
            return value;
        } else {
            throw __builtins__.PY$AttributeError("Object " + js(str(obj)) + " does not have attribute " + name);
        }
    }
};
__builtins__.PY$globals = $PY.c_nif;
__builtins__.PY$hasattr = function(obj, name) {
    name = js(name);
    return obj["PY$" + name] === undefined ? False : True;
};
__builtins__.PY$hash = function(obj) {
    if (obj.PY$__hash__ !== undefined) {
        return obj.PY$__hash__();
    } else if (typeof(obj) === 'number') {
        return obj === -1 ? -2 : obj;
    } else {
        throw __builtins__.PY$AttributeError('__hash__');
    }
};
__builtins__.PY$help = function() {
    __builtins__.PY$print("Welcome to pyjaco, the Python-to-Javascript compiler!\n" +
                          "  Homepage     : pyjaco.org\n" +
                          "  Github       : https://github.com/chrivers/pyjaco\n" +
                          "  Email        : developer@pyjaco.org\n" +
                          "  Google group : http://groups.google.com/group/pyjaco");
};
__builtins__.PY$hex = function(num) {
    if (num.PY$__class__ === __builtins__.PY$int) {
        var hex = num._js_().toString(16);
        if (hex.charAt(0) === "-") {
            return __builtins__.PY$str("-0x" + hex.substr(1));
        } else {
            return __builtins__.PY$str("0x" + hex);
        }
    } else {
        throw __builtins__.PY$TypeError("hex() argument can't be converted to hex");
    }
};
__builtins__.PY$id = function(obj) {
    return __builtins__.PY$int(obj.id);
}
__builtins__.PY$input = $PY.c_nif;
__builtins__.PY$intern = function(x) {
    if ($PY.isinstance(x, __builtins__.PY$basestring)) {
    } else {
        throw __builtins__.PY$TypeError("must be string, not " + x.PY$__class__.PY$__name__);
    }
};
__builtins__.PY$isinstance = function(obj, cls) {
    if (cls.PY$__class__ === tuple) {
        var length = cls.PY$__len__()._js_();
        obj = obj.PY$__class__;
        while (obj) {
            for (var i = 0; i < length; i++) {
                if (obj === cls.PY$__getitem__(i))
                    return True;
            }
            obj = obj.PY$__super__;
        }
        return False;
    } else if (cls.PY$__super__ !== undefined) {
        var c = obj.PY$__class__;
        while (c) {
            if (c === cls)
                return True;
            c = c.PY$__super__;
        }
        return False;
    } else {
        throw __builtins__.PY$TypeError("isinstance() arg 2 must be a class, type, or tuple of classes and types");
    }
};
__builtins__.PY$issubclass = function(obj, cls) {
    if (cls.PY$__class__ === tuple) {
        var length = cls.PY$__len__()._js_();
        while (obj) {
            for (var i = 0; i < length; i++) {
                if (obj === cls.PY$__getitem__(i))
                    return True;
            }
            obj = obj.PY$__super__;
        }
        return False;
    } else if (cls.PY$__super__ !== undefined) {
        while (obj) {
            if (obj === cls)
                return True;
            obj = obj.PY$__super__;
        }
        return False;
    } else {
        throw __builtins__.PY$TypeError("issubclass() arg 2 must be a class or tuple of classes");
    }
};
__builtins__.PY$len = function(obj) {
    if (obj.PY$__len__ !== undefined) {
        return obj.PY$__len__();
    } else {
        throw __builtins__.PY$AttributeError('__len__');
    }
};
__builtins__.PY$license = function() {
    return __builtins__.PY$str("See the file LICENSE in the pyjaco distribution for details.");
};
__builtins__.PY$locals = $PY.c_nif;
__builtins__.PY$long = $PY.c_nif;
__builtins__.PY$map = function() {
    if (arguments.length < 2) {
        throw __builtins__.PY$TypeError("__builtins__.PY$map() requires at least two args");
    }
    if (arguments.length > 2) {
        throw __builtins__.PY$NotImplementedError("only one sequence allowed in __builtins__.PY$map()");
    }
    var func = arguments[0];
    var items = list();
    iterate(arguments[1], function(item) {
        items.PY$append(func(item));
    });
    if (__builtins__.PY$__python3__)
        return iter(items);
    else
        return items;
};
__builtins__.PY$max = function(list) {
    if (__builtins__.PY$len(list).PY$__eq__($c0) === True)
        throw __builtins__.PY$ValueError("max() arg is an empty sequence");
    else {
        var result = null;
        iterate(list, function(item) {
                if ((result === null) || js(item.PY$__gt__(result)))
                    result = item;
        });
        return result;
    }
};
__builtins__.PY$memoryview = $PY.c_nif;
__builtins__.PY$min = function(list) {
    if (__builtins__.PY$len(list).PY$__eq__($c0) === True)
        throw __builtins__.PY$ValueError("min() arg is an empty sequence");
    else {
        var result = null;
        iterate(list, function(item) {
                if ((result === null) || js(item.PY$__lt__(result)))
                    result = item;
        });
        return result;
    }
};
__builtins__.PY$next = $PY.c_nif;
__builtins__.PY$oct = function(num) {
    if (num.PY$__class__ === __builtins__.PY$int) {
        var oct = num._js_().toString(8);
        if (oct.charAt(0) === "-") {
            return __builtins__.PY$str("-0" + oct.substr(1));
        } else if (oct === "0") {
            return __builtins__.PY$str("0");
        } else {
            return __builtins__.PY$str("0" + oct);
        }
    } else {
        throw __builtins__.PY$TypeError("oct() argument can't be converted to oct");
    }
};
__builtins__.PY$open = $PY.c_nif;
__builtins__.PY$ord = function(ord) {
    var s = ord._js_();
    if (s.length === 1) {
        return __builtins__.PY$int(s.charCodeAt(0));
    } else {
        throw __builtins__.PY$TypeError("ord() expected a character, but string of length " + s.length + " found");
    }
};
__builtins__.PY$pow = function(x, y, z) {
    if (z !== undefined) {
        throw __builtins__.PY$NotImplemented("Pyjaco does not support the 3-operand version of pow()");
    } else if (x.PY$__pow__ !== undefined) {
        if (y.obj < 0) {
            return __builtins__.PY$float(x).PY$__pow__(y);
        } else {
            return x.PY$__pow__(y);
        }
    } else {
        throw __builtins__.PY$TypeError("unsupported operand type(s) for ** or pow(): '" +
                                        x.PY$__class__.PY$__name__ + "' and '" +
                                        y.PY$__class__.PY$__name__ + "'");
    }
};
if (typeof console !== 'undefined' && console.log !== undefined) {
    if (console.log.apply !== undefined) {
        __builtins__.PY$print = function()  {
            console.log.apply(console, arguments);
        };
    } else {
        __builtins__.PY$print = function()  {
            var args = js(str(" ").PY$join(tuple(Array.prototype.slice.call(arguments))));
            console.log(args);
        };
    }
} else if (typeof WScript !== 'undefined') {
    __builtins__.PY$print = function() {
        var args = js(str(" ").PY$join(tuple(Array.prototype.slice.call(arguments))));
        WScript.Echo(args);
    };
} else if (typeof window === 'undefined' || window.print !== print) {
    __builtins__.PY$print = function() {
        if (arguments.length <= 1) {
            if (arguments[0] !== undefined) {
                print(__builtins__.PY$str(arguments[0]));
            } else {
                print("");
            }
        } else {
            print.apply(null, arguments);
        }
    };
} else {
    __builtins__.PY$print = function() {
        var args = tuple(Array.prototype.slice.call(arguments));
        alert(js(__builtins__.PY$str(" ").PY$join(__builtins__.PY$map(__builtins__.PY$repr, args))));
    };
}
__builtins__.PY$property = $PY.c_nif;
__builtins__.PY$quit = function() {
    if (quit !== undefined) {
        quit();
    } else {
        throw __builtins__.PY$SystemExit("quit");
    }
};
__builtins__.PY$range = function(start, end, step) {
    start = js(start);
    if (end === undefined) {
        end = start;
        start = 0;
    } else {
        end = js(end);
    }
    if (step === undefined) {
        step = 1;
    } else {
        step = js(step);
    }
    var seq = [];
    for (var i = start; i < end; i += step) {
        seq.push(i);
    }
    if (__builtins__.PY$__python3__)
        return iter(seq);
    else
        return list(seq);
};
__builtins__.PY$raw_input = $PY.c_nif;
__builtins__.PY$reduce = function(func, seq) {
    var initial;
    if (arguments.length === 3) {
        initial = arguments[2];
    } else {
        initial = null;
    }
    if (__builtins__.PY$len(seq)._js_() < 2) {
        return initial;
    }
    var accum, start;
    if (arguments.length === 3) {
        accum = initial;
        start = 0;
    } else {
        accum = func(seq.PY$__getitem__(0), seq.PY$__getitem__(1));
        start = 2;
    }
    for (var i = start; i < __builtins__.PY$len(seq)._js_(); i++) {
        accum = func(accum, seq.PY$__getitem__(i));
    }
    return accum;
};
__builtins__.PY$reload = $PY.c_nif;
__builtins__.PY$repr = function(obj) {
    if (obj === undefined) {
        return str("None");
    } else if (obj.PY$__class__ === undefined) {
        return object.PY$__repr__.call(obj);
    } else if (obj.PY$__repr__ !== undefined) {
        return obj.PY$__repr__(obj);
    } else if (obj.PY$__str__ !== undefined) {
        return obj.PY$__str__(obj);
    } else {
        throw __builtins__.PY$AttributeError('__repr__ or __str__ not found on ' + typeof(obj));
    }
};
__builtins__.PY$reversed = function(iterable) {
    var l = list(iterable);
    l.PY$reverse();
    return l;
}
__builtins__.PY$round = function(num) {
    if (num.PY$__class__ === __builtins__.PY$float) {
        var n = num.obj;
        if (n < 0) {
            return __builtins__.PY$float(-Math.round(-num.obj));
        } else {
            return __builtins__.PY$float(Math.round(num.obj));
        }
    } else if (num.PY$__class__ === __builtins__.PY$int) {
        return __builtins__.PY$float(num.obj);
    } else {
        throw __builtins__.PY$TypeError("a float is required");
    }
};
__builtins__.PY$set = $PY.c_nif;
__builtins__.PY$setattr = function(obj, name, value) {
    obj.PY$__setattr__(name, value);
};
__builtins__.PY$sorted = function(iterable) {
    var l = list(iterable);
    l.PY$sort();
    return l;
};
__builtins__.PY$staticmethod = function(func) {
    var res = function () {
        return func.apply(null, [null].concat(Array.prototype.slice.call(arguments)));
    };
    res.__static = true;
    return res;
};
__builtins__.PY$sum = function(list) {
    var result = 0;
    iterate(list, function(item) {
        result += js(item);
    });
    return result;
};
__builtins__.PY$type = function(obj) {
    if (obj && obj.PY$__class__) {
        return obj.PY$__class__;
    } else {
        return __builtins__.PY$None;
    }
};
__builtins__.PY$unichr = function(unichr) {
    var s = String.fromCharCode(unichr._js_());
    if (s === "\0") {
        throw __builtins__.PY$TypeError("an integer is required");
    } else {
        return __builtins__.PY$unicode(s);
    }
};
__builtins__.PY$vars = $PY.c_nif;
__builtins__.PY$xrange = function(start, end, step) {
    return iter(__builtins__.PY$range(start, end, step));
};
__builtins__.PY$zip = function() {
    if (!arguments.length) {
        return list();
    }
    var iters = list();
    var i;
    for (i = 0; i < arguments.length; i++) {
        iters.PY$append(iter(arguments[i]));
    }
    var items = list();
    while (true) {
        var item = list();
        for (i = 0; i < arguments.length; i++) {
            try {
                var value = iters.PY$__getitem__(i).PY$next();
            } catch (exc) {
                if (exc === $PY.c_stopiter || $PY.isinstance(exc, __builtins__.PY$StopIteration)) {
                    return items;
                } else {
                    throw exc;
                }
            }
            item.PY$append(value);
        }
        items.PY$append(tuple(item));
    }
    return None;
};

/* 11-classes.js                 */
var __inherit = function(cls, name, prototyping) {
    if (name === undefined) {
        throw __builtins__.PY$TypeError("The function __inherit must get exactly 2 arguments");
    }
    var res = function() {
        var x = res.PY$__create__;
        if (x !== undefined) {
            return res.PY$__create__.apply(null, [res].concat(Array.prototype.slice.call(arguments)));
        } else {
            throw __builtins__.PY$AttributeError("Class " + name + " does not have __create__ method");
        }
    };
    for (var o in cls) {
        res[o] = cls[o];
    }
    res.PY$__name__  = name;
    res.PY$__super__ = cls;
    res.prototyping  = prototyping;
    return res;
};
var object = __inherit(null, "object");
__builtins__.PY$object = object;
object.PY$__init__ = function() {
};
object.PY$__create__ = function(cls) {
    var args = Array.prototype.slice.call(arguments, 1);
    var obj = function() {
        var args = Array.prototype.slice.call(arguments);
        var x = cls.PY$__call__;
        if (x !== undefined) {
            return cls.PY$__call__.apply(obj, args);
        } else {
            throw __builtins__.PY$AttributeError("Object " + js(cls.PY$__name__) + " does not have __call__ method");
        }
    };
    if (obj.__proto__ === undefined) {
        if (cls.prototyping) {
            var x = function() {};
            x.prototype = cls;
            obj = new x();
        } else {
            for (var o in cls) {
                obj[o] = cls[o];
            }
        }
    } else {
        obj.__proto__ = cls;
    };
    obj.PY$__class__ = cls;
    obj.PY$__super__ = undefined;
    obj.id = prng();
    obj.PY$__init__.apply(obj, args);
    return obj;
};
object.PY$__setattr__ = function(k, v) {
    this["PY$" + k] = v;
};
object.PY$__getattribute__ = function(k) {
    var q = this["PY$" + k];
    if ((typeof q === 'function') && (q.PY$__class__ === undefined) && (k !== '__class__') && arguments[1] !== false) {
        var that = this;
        if (this.PY$__class__ === undefined && !q.__static) {
            var t = function() { return q.apply(arguments[0], Array.prototype.slice.call(arguments, 1)); };
        } else {
            if (q.PY$__super__ !== undefined) {
                return q;
            } else {
                var t = function() { return q.apply(that, arguments); };
            }
        }
        return t;
    } else if (k === '__name__') {
        return str(this.PY$__name__);
    } else {
        if (q === undefined) {
            if (this.PY$__getattr__) {
                return this.PY$__getattr__(py(k));
            } else {
                throw __builtins__.PY$AttributeError(js(this.PY$__repr__()) + " does not have attribute '" + js(k) + "'");
            }
        } else {
            return q;
        }
    }
};
object.PY$__delattr__ = function(k) {
    delete this["PY$" + k];
};
object.PY$__repr__ = function() {
    if (this.PY$__class__) {
        return str("<instance of " + this.PY$__class__.PY$__name__ + " at 0x" + this.id.toString(16) + ">");
    } else if (this.PY$__name__) {
        return str("<type '" + this.PY$__name__ + "'>");
    } else {
        return str("<javascript: " + this + ">");
    }
};
object.PY$__str__ = object.PY$__repr__;
object.PY$__eq__ = function(other) {
    return this === other ? True : False;
};
object.PY$__ne__ = function (other) {
    return $PY.__not__(this.PY$__eq__(other));
};
object.PY$__gt__ = function(other) {
    if (this.PY$__class__ === undefined) {
        return this.PY$__name__ > other.PY$__name__ ? True : False;
    } else {
        return this.PY$__class__.PY$__name__ > other.PY$__class__.PY$__name__ ? True : False;
    }
};
object.PY$__lt__ = function(other) {
    if (other === this) {
        return False;
    } else {
        if (this.PY$__class__ === undefined) {
            return this.PY$__name__ < other.PY$__name__ ? True : False;
        } else {
            return this.PY$__class__.PY$__name__ < other.PY$__class__.PY$__name__ ? True : False;
        }
    }
};
object.PY$__ge__ = function(other) {
    return this.PY$__lt__(other) === False ? True : False;
};
object.PY$__le__ = function(other) {
    return this.PY$__gt__(other) === False ? True : False;
};
object.PY$__cmp__ = function (y) {
    if (this.PY$__gt__(y) === True) {
        return $c1;
    } else {
        if (this.PY$__lt__(y) === True) {
            return $cn1;
        } else {
            return $c0;
        }
    }
};
object.toString = function () {
    return js(this.PY$__str__());
};
object.valueOf = function () {
    return js(this);
};

/* 12-exceptions.js              */
var BaseException = __inherit(object, "BaseException");
__builtins__.PY$BaseException = BaseException;
BaseException.PY$__init__ = function() {
    if (arguments.length > 0) {
        this.PY$message = arguments[0];
    } else {
        this.PY$message = "";
    }
    this.message = "pyjaco: " + js(this.PY$__class__.PY$__name__) + ": " + js(this.PY$message);
};
BaseException.PY$__str__ = function() {
    return __builtins__.PY$str(this.PY$message);
};
(function() {
     var exceptions = [
         "SystemExit", [],
         "KeyboardInterrupt", [],
         "GeneratorExit", [],
         "Exception", [
             "StopIteration", [],
             "StandardError", [
                 "BufferError", [],
                 "ArithmeticError", [
                     "FloatingPointError", [],
                     "OverflowError", [],
                     "ZeroDivisionError", []
                 ],
                 "AssertionError", [],
                 "AttributeError", [],
                 "EnvironmentError", [
                     "IOError", [],
                     "OSError", []
                 ],
                 "EOFError", [],
                 "ImportError", [],
                 "LookupError", [
                     "IndexError", [],
                     "KeyError", []
                 ],
                 "MemoryError", [],
                 "NameError", [
                     "UnboundLocalError", []
                 ],
                 "ReferenceError", [],
                 "RuntimeError", [
                     "NotImplementedError", []
                 ],
                 "SyntaxError", [
                     "IndentationError", [
                         "TabError", []
                     ]
                 ],
                 "SystemError", [],
                 "TypeError", [],
                 "ValueError", [
                     "UnicodeError", [
                         "UnicodeDecodeError", [],
                         "UnicodeEncodeError", [],
                         "UnicodeTranslateError", []
                     ]
                 ]
             ],
             "Warning", [
                 "DeprecationWarning", [],
                 "PendingDeprecationWarning", [],
                 "RuntimeWarning", [],
                 "SyntaxWarning", [],
                 "UserWarning", [],
                 "FutureWarning", [],
	         "ImportWarning", [],
	         "UnicodeWarning", [],
	         "BytesWarning", []
             ]
         ]
     ];
     function create_exceptions(base, names)
     {
         for (var i = 0; i < names.length; i += 2)
         {
             var name = names[i];
             var subs = names[i+1];
             var exc = __inherit(base, name);
             __builtins__["PY$" + name] = exc;
             create_exceptions(exc, subs);
         }
     }
     create_exceptions(BaseException, exceptions);
})();
$PY.c_stopiter = __builtins__.PY$StopIteration("No more items");

/* 13-super.js                   */
__builtins__.PY$super = __inherit(object, "Super");
var Super = __builtins__.PY$super;
Super.PY$__init__ = function(cls, obj) {
    this.cls = cls;
    this.obj = obj;
};
Super.PY$__getattribute__ = function(k) {
    var q = this.cls.PY$__super__.PY$__getattribute__(k, false);
    if ((typeof q === 'function') && q.PY$__class__ === undefined) {
        var that = this.obj;
        var t = function() { return q.apply(that, arguments); };
        t.PY$__call__ = t;
        return t;
    } else {
        return q;
    }
};
Super.PY$__repr__ = function() {
    return str("<super " + this.cls.toString() + ", " + this.obj.toString() + ">");
};
Super.PY$__str__ = Super.PY$__repr__;

/* 14-module.js                  */
var module = __inherit(object, "module");
module.PY$__init__ = function(modname, filename, objects) {
    this.PY$__name__ = modname;
    this.modname = modname;
    this.filename = filename;
    if (objects !== undefined) {
        for (var o in objects) {
            if (o.charAt(2) === "$") {
                this[o] = objects[o];
            }
        }
    }
};
module.__import = function (name, asname) {
    var mod = this.__load(name);
    this["PY$"+(asname||name)] = mod;
};
module.__import_from = function (from, name, asname) {
    var modname, loaded_module;
    modname = from + '.' + name;
    from = this.__load(from)
    loaded_module = __builtins__.PY$getattr(from, name, false);
    if (!loaded_module) {
        loaded_module = this.__load(modname);
    }
    if (!loaded_module) {
        throw __builtins__.PY$ImportError("ImportError: Cannot import name "+name);
    }
    this["PY$"+(asname||name)] = loaded_module;
};
module.__load = function(name) {
    var i, mod,nextmod, splitted;
    splitted = name.split('.');
    for (i=1; i<=splitted.length; i++) {
        if (!mod) {
            mod = this.__load_module(splitted.slice(0, i).join('.'));
        } else {
            nextmod = mod.__load_module(splitted.slice(0, i).join('.'));
            if (!__builtins__.PY$getattr(mod, splitted[i-1], false)) { 
                mod["PY$"+splitted[i-1]] = nextmod;
            }
            mod = nextmod;  
        }
    }
    return mod;
};
module.__load_module = function(modname) {
    var mod, loaded_module;
    if ($PY.loaded_modules.hasOwnProperty(modname)) {
        return $PY.loaded_modules[modname];
    } else if ($PY.available_modules.hasOwnProperty(modname)) {
        mod = $PY.available_modules[modname];
    } else {
        if ($PY.load_lazy) {
            $PY.load_lazy(modname); // loads the module from the internet, it must be available after it's been called
            if ($PY.available_modules.hasOwnProperty(modname)) {
                mod = $PY.available_modules[modname];
            }
        }
    }
    if (!mod) {
        return false;
        throw __builtins__.PY$ImportError("ImportError: No module named "+modname);
    }
    if (!!mod) {
        loaded_module = module(mod.name, mod.filename);
        loaded_module.modname = modname;
        $PY.loaded_modules[modname] = loaded_module;
        mod.body(loaded_module);
    }
    return loaded_module;
};
module.PY$__getattribute__ = function(k) {
    var q = this["PY$" + k];
    if (q === undefined) {
        throw __builtins__.PY$AttributeError(js(this.PY$__repr__()) + " does not have attribute '" + js(k) + "'");
    } else {
        return q;
    }
};
module.PY$__repr__ = function() {
    return str("<module '" + this.modname + "' " + this.filename + ">");
};
module.PY$__str__ = module.PY$__repr__;

/* 20-type-iter.js               */
var iter = __inherit(object, "iter");
__builtins__.PY$iter = iter;
iter.PY$__init__ = function(obj) {
    this.index = 0;
    if (obj === undefined) {
        throw __builtins__.PY$TypeError("iter() expects at least 1 argument");
    } else if (obj instanceof Array) {
        this.seq = obj;
    } else if (typeof obj === "string") {
        this.seq = obj.split("");
        for (var i = 0; i < this.seq.length; i++) {
            this.seq[i] = str(this.seq[i]);
        }
    } else {
        throw __builtins__.PY$TypeError("object is not iterable");
    }
};
var __iter_real__ = iter.PY$__create__;
iter.PY$__create__ = function(cls, obj) {
    if (obj.PY$__class__ === iter) {
       return obj;
    } else if (obj.PY$__iter__ !== undefined) {
        return obj.PY$__iter__();
    } else {
        return __iter_real__(cls, obj);
    }
};
iter.PY$__str__ = function () {
    return str("<iterator of " + this.seq + " at " + this.index + ">");
};
iter.PY$next = function() {
    var value = this.seq[this.index++];
    if (this.index <= this.seq.length) {
        if (value === undefined) {
            return None;
        } else {
            return value;
        }
    } else {
        throw $PY.c_stopiter;
    }
};
iter.next = function() {
    if (this.index >= this.seq.length) {
        return null;
    } else {
        return this.seq[this.index++];
    }
};

/* 21-type-slice.js              */
var slice = __inherit(object, "slice");
__builtins__.PY$slice = slice;
slice.PY$__init__ = function(start, stop, step) {
    if (stop === undefined && step === undefined)
    {
        stop = start;
        start = null;
    }
    if (!start && start != 0) start = null;
    if (stop === undefined) stop = null;
    if (step === undefined) step = null;
    this.start = js(start);
    this.stop = js(stop);
    this.step = js(step);
};
slice.PY$__str__ = function() {
    return str("slice(" + this.start + ", " + this.stop + ", " + this.step + ")");
};
slice.PY$indices = function(n) {
    n = js(n);
    var start = this.start;
    if (start === null)
        start = 0;
    if (start > n)
        start = n;
    if (start < 0)
        start = n+start;
    var stop = this.stop;
    if (stop > n)
        stop = n;
    if (stop === null)
        stop = n;
    if (stop < 0)
        stop = n+stop;
    var step = this.step;
    if (step === null)
        step = 1;
    return tuple([start, stop, step]);
};

/* 22-type-tuple.js              */
var tuple = __inherit(object, "tuple");
__builtins__.PY$tuple = tuple;
tuple.PY$__init__ = function(seq) {
    if (arguments.length > 1) {
        throw __builtins__.PY$TypeError("tuple() takes at most 1 argument (" + arguments.length + " given)");
    } else if (seq === undefined) {
        this.items = [];
    } else if (seq.PY$__class__ === list || seq.PY$__class__ === tuple) {
        this.items = seq.items.concat();
    } else {
        var that = this;
        this.items = [];
        iterate(seq, function(elm) {
                    if (typeof elm === 'number')
                        that.items.push(int(elm));
                    else if (typeof elm === 'string')
                        that.items.push(str(elm));
                    else
                        that.items.push(elm);
                });
    }
};
tuple.PY$__str__ = function () {
    if (this.items.length === 0) {
        return str("()");
    } else if (this.items.length === 1) {
        return str("(" + str(this.items[0])._js_() + ",)");
    } else {
        var res = "(" + js(__builtins__.PY$repr(this.items[0]));
        for (var i = 1; i < this.items.length; i++)  {
            res += ", " + js(__builtins__.PY$repr(this.items[i]));
        }
        return str(res + ")");
    }
};
tuple.PY$__repr__ = tuple.PY$__str__;
tuple.PY$__eq__ = function (other) {
    if (other.PY$__class__ === this.PY$__class__) {
        if (this.items.length != js(__builtins__.PY$len(other))) {
            return False;
        }
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].PY$__ne__(other.items[i]) === True) {
                return False;
            }
        }
        return True;
    } else {
        return False;
    }
};
tuple.PY$__cmp__ = function (other) {
    if (this.PY$__class__ === undefined) {
        return object.PY$__cmp__.call(this, other);
    }
    if (other.PY$__class__ !== this.PY$__class__) {
        if (object.PY$__gt__.call(this, other) === True) {
            return $c1;
        } else {
            if (object.PY$__lt__.call(this, other) === True) {
                return $cn1;
            } else {
                return $c0;
            }
        }
    } else {
        var count = 0;
        var res = $c0;
        try {
            var it = iter(other);
        } catch (exc) {
            if ($PY.isinstance(exc, __builtins__.PY$TypeError)) {
                return $c1;
            } else {
                throw exc;
            }
        }
        while (true) {
            try {
                var elm = it.PY$next();
            } catch (exc) {
                if (exc === $PY.c_stopiter || $PY.isinstance(exc, __builtins__.PY$StopIteration)) {
                    break;
                } else {
                    throw exc;
                }
            }
            if (count >= this.items.length) {
                res = $cn1;
                break;
            }
            var r = this.items[count].PY$__cmp__(elm);
            if (r.PY$__gt__($c0) === True) {
                res = $c1;
                break;
            } else if (r.PY$__lt__($c0) === True) {
                res = $cn1;
                break;
            }
            count++;
        }
        if (res === $c0) {
            if (this.items.length > count) {
                return $c1;
            } else {
                return $c0;
            }
        } else {
            return res;
        }
    }
};
tuple.PY$__gt__ = function (other) {
    if (this.PY$__class__ === undefined) {
        return object.PY$__gt__.call(this, other);
    } else {
        return this.PY$__cmp__(other).PY$__gt__($c0);
    }
};
tuple.PY$__lt__ = function (other) {
    if (this.PY$__class__ === undefined) {
        return object.PY$__lt__.call(this, other);
    } else {
        return this.PY$__cmp__(other).PY$__lt__($c0);
    }
};
tuple.PY$__mul__ = function(num) {
    if ($PY.isinstance(num, int)) {
        var res = [];
        var count = num._js_();
        for (var i = 0; i < count; i++) {
            res = res.concat(this.items);
        }
        return this.PY$__class__(res);
    } else {
        var name = this.PY$__class__.PY$__name__;
        throw __builtins__.PY$NotImplementedError("Cannot multiply " + name + " and non-int");
    }
};
tuple.PY$__add__ = function(other) {
    if (this.PY$__class__ === other.PY$__class__) {
        var res = this.items.concat([]);
        iterate(other, function(elm) {
                    res.push(elm);
                });
        return this.PY$__class__(res);
    } else {
        var name = this.PY$__class__.PY$__name__;
        throw __builtins__.PY$NotImplementedError("Cannot add " + name + " and non-" + name);
    }
};
tuple._js_ = function () {
    var items = [];
    iterate(this, function(item) {
        items.push(js(item));
    });
    return items;
};
tuple.PY$__hash__ = function () {
    var value = 0x345678;
    var length = this.items.length;
    for (var index in this.items) {
        value = ((1000003*value) & 0xFFFFFFFF) ^ __builtins__.PY$hash(this.items[index]);
        value = value ^ length;
    }
    if (value === -1) {
        value = -2;
    }
    return value;
};
tuple.PY$__len__ = function() {
    return int(this.items.length);
};
tuple.PY$__iter__ = function() {
    return iter(this.items);
};
tuple.PY$__contains__ = function(item) {
    for (var index in this.items) {
        if (this.items[index].PY$__eq__(item) === True) {
            return True;
        }
    }
    return False;
};
tuple.PY$__getitem__ = function(index) {
    var seq;
    if ($PY.isinstance(index, slice)) {
        var s = index;
        var inds = js(s.PY$indices(this.items.length));
        var start = inds[0];
        var stop = inds[1];
        var step = inds[2];
        seq = [];
        for (var i = start; i < stop; i += step) {
            seq.push(this.items[i]);
        }
        return this.PY$__class__(seq);
    } else {
        index = js(int(index));
        var len = this.items.length;
        if (index >= 0 && index < len) {
            return this.items[index];
        } else if (index < 0 && index >= -len) {
            return this.items[index + len];
        } else {
            throw __builtins__.PY$IndexError("list index out of range");
        }
    }
};
tuple.PY$__setitem__ = function() {
    throw __builtins__.PY$TypeError("'tuple' object doesn't support item assignment");
};
tuple.PY$__delitem__ = function() {
    throw __builtins__.PY$TypeError("'tuple' object doesn't support item deletion");
};
tuple.PY$count = function(value) {
    var count = 0;
    for (var index in this.items) {
        if (this.items[index].PY$__eq__(value) === True) {
            count += 1;
        }
    }
    return count;
};
tuple.PY$index = function(value, start, end) {
    if (start === undefined) {
        start = 0;
    } else {
        start = js(start);
    }
    end = js(end);
    for (var i = start; (end === undefined) || (start < end); i++) {
        var _value = this.items[i];
        if (_value === undefined) {
            break;
        }
        if (_value.PY$__eq__(value) === True) {
            return int(i);
        }
    }
    throw __builtins__.PY$ValueError(this.PY$__class__.PY$__name__ + ".index(x): x not in list");
};
__builtins__.PY$tuple = tuple;
$PY.$c_emptytuple = tuple();

/* 23-type-list.js               */
var list = __inherit(object, "list");
__builtins__.PY$list = list;
list.PY$__init__ = tuple.PY$__init__;
list.PY$__str__ = function () {
    if (this.items.length === 0) {
        return str("[]");
    } else {
        var res = "[" + js(__builtins__.PY$repr(this.items[0]));
        for (var i = 1; i < this.items.length; i++)  {
            res += ", " + js(__builtins__.PY$repr(this.items[i]));
        }
        return str(res + "]");
    }
};
list.PY$__eq__ = tuple.PY$__eq__;
list.PY$__cmp__ = tuple.PY$__cmp__;
list.PY$__gt__ = tuple.PY$__gt__;
list.PY$__lt__ = tuple.PY$__lt__;
list.PY$__mul__ = tuple.PY$__mul__;
list.PY$__add__ = tuple.PY$__add__;
list.PY$__repr__ = list.PY$__str__;
list._js_ = tuple._js_;
list.PY$__len__ = tuple.PY$__len__;
list.PY$__iter__ = tuple.PY$__iter__;
list.PY$__contains__ = tuple.PY$__contains__;
list.PY$__getitem__ = tuple.PY$__getitem__;
list.PY$__setitem__ = function(index, value) {
    index = js(int(index));
    var len = this.items.length;
    if (index >= 0 && index < len) {
        this.items[index] = value;
    } else if (index < 0 && index >= -len) {
        this.items[index + len] = value;
    } else {
        throw __builtins__.PY$IndexError("list index out of range");
    }
};
list.PY$__setslice__ = function(lower, upper, value) {
    var it = list(value).items;
    lower = js(lower);
    upper = js(upper);
    if (lower < this.items.length && upper < this.items.length) {
        this.items = this.items.slice(0, lower).concat(it).concat(this.items.slice(upper, this.items.length));
    }
};
list.PY$__delitem__ = function(index) {
    if (typeof(index) !== 'number') index = js(index);
    if ((index >= 0) && (index < this.items.length)) {
        var a = this.items.slice(0, index);
        var b = this.items.slice(index+1, this.items.length);
        this.items = a.concat(b);
    } else
        throw __builtins__.PY$IndexError("list assignment index out of range");
};
list.PY$__delslice__ = function(x, y) {
    x = js(x);
    y = js(y);
    if ((x >= 0) && (y < this.items.length)) {
        var a = this.items.slice(0, x);
        var b = this.items.slice(y);
        this.items = a.concat(b);
    } else
        throw __builtins__.PY$IndexError("list assignment index out of range");
};
list.PY$count = tuple.PY$count;
list.PY$index = tuple.PY$index;
list.PY$remove = function(value) {
    this.PY$__delitem__(this.PY$index(value));
};
list.PY$append = function(value) {
    if (typeof(value) === 'string') {
        this.items.push(str(value));
    } else if (typeof(value) === 'number') {
        this.items.push(int(value));
    } else {
        this.items.push(value);
    }
};
list.PY$extend = function(l) {
    var items;
    items = this.items;
    iterate(l, function(item) {
        items.push(item);
    });
};
list.PY$pop = function() {
    if (this.items.length > 0) {
        return this.items.pop();
    } else
        throw __builtins__.PY$IndexError("pop from empty list");
};
list.PY$sort = function() {
    var __kwargs = __kwargs_get(arguments);
    var cmp = js(arguments[0]);
    if (cmp === undefined) { cmp = (__builtins__.PY$bool(__kwargs.cmp) == false) ? function(a, b) { return js(a.PY$__cmp__(b));} : __kwargs.cmp; };
    var key = js(arguments[1]);
    if (key === undefined) { key = (__builtins__.PY$bool(__kwargs.key) == false) ? function(x) { return x; } : __kwargs.key; };
    var reverse = arguments[2];
    if (reverse === undefined) { reverse = (__builtins__.PY$bool(__kwargs.reverse) == false) ? False : __kwargs.reverse; };
    var direction = reverse === True ? -1 : 1;
    this.items.sort(function (a, b) {return js(cmp(key(a), key(b))) * direction;});
};
list.PY$insert = function(index, x) {
    var i = js(index);
    var a = this.items.slice(0, i);
    var b = this.items.slice(i);
    this.items = a.concat([x], b);
};
list.PY$reverse = function() {
    var new_list = list();
    iterate(this, function(item) {
            new_list.PY$insert(0, item);
    });
    this.items = new_list.items;
};

/* 24-type-dict.js               */
var dict = __inherit(object, "dict");
__builtins__.PY$dict = dict;
dict.PY$__init__ = function() {
    var items;
    var key;
    var value;
    var kwargs = __kwargs_get(arguments);
    var args = arguments[0];
    if (args !== undefined) {
        if (args.PY$__class__ === dict) {
            items = args.items.slice();
        } else if (args.PY$__iter__ !== undefined) {
            items = [];
            iterate(args, function(item) {
                        items.push(item.PY$__getitem__($c0));
                        items.push(item.PY$__getitem__($c1));
            });
        } else if (args.length === undefined) {
            items = [];
            for (var item in args) {
                items.push(str(item));
                items.push(args[item]);
            };
        } else {
            items = args.slice();
        }
        this.items = items;
    } else {
        this.items = [];
    }
    for (var p in kwargs) {
        this.PY$__setitem__(str(p), kwargs[p]);
    }
};
dict.PY$__str__ = function () {
    var strings = [];
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        strings.push($PY.repr(items[i]) + ": " + $PY.repr(items[i+1]));
    }
    return str("{" + js(strings.join(", ")) + "}");
};
dict.PY$__repr__ = dict.PY$__str__;
dict._js_ = function () {
    var items = {};
    for (var i = 0; i < this.items.length; i += 2) {
        items[str(this.items[i])] = js(this.items[i+1]);
    }
    return items;
};
dict.PY$__hash__ = function () {
    throw __builtins__.PY$TypeError("unhashable type: 'dict'");
};
dict.PY$__len__ = function() {
    return int(this.items.length / 2);
};
dict.PY$__iter__ = function() {
    return iter(this.PY$keys());
};
dict.PY$__contains__ = function(key) {
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            return True;
        }
    }
    return False;
};
dict.PY$__getitem__ = function(key) {
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            return items[i+1];
        }
    }
    throw __builtins__.PY$KeyError(str(key));
};
dict.PY$__setitem__ = function(key, value) {
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            items[i+1] = value;
            return;
        }
    }
    items.push(key);
    items.push(value);
};
dict.PY$__delitem__ = function(key) {
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            this.items = items.slice(0, i).concat(items.slice(i+2));
            return;
        }
    }
    throw __builtins__.PY$KeyError(str(key));
};
dict.PY$get = function(key, value) {
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            return items[i+1];
        }
    }
    if (value !== undefined) {
        return value;
    } else {
        return None;
    }
};
dict.PY$items = function() {
    var res = [];
    var items = this.items;
    for (var i = 0; i < items.length; i += 2) {
        res.push(tuple([items[i], items[i+1]]));
    }
    return list(res);
};
dict.PY$keys = function() {
    var res = [];
    var items = this.items;
    for (var i = 0; i < this.items.length; i += 2) {
        res.push(items[i]);
    }
    return list(res);
};
dict.PY$values = function() {
    var res = [];
    var items = this.items;
    for (var i = 1; i < items.length; i += 2) {
        res.push(items[i]);
    }
    return list(res);
};
dict.PY$update = function(other) {
   var self = this;
   iterate(other,
     function(key) {
         self.PY$__setitem__(key, other.PY$__getitem__(key));
     }
   );
};
dict.PY$clear = function() {
    this.items = [];
};
dict.PY$pop = function(key, value) {
    var items = this.items;
    var res = null;
    for (var i = 0; i < items.length; i += 2) {
        if (items[i].PY$__eq__(key) === True) {
            res = items[i+1];
            this.items = items.slice(0, i).concat(items.slice(i+2));
        }
    }
    if (res !== null) {
        return res;
    } else if (value !== undefined) {
        return value;
    } else {
        throw __builtins__.PY$KeyError(str(key));
    }
};
dict.PY$popitem = function() {
    var items = this.items;
    if (items.length > 1) {
        var item = items.pop();
        var key = items.pop();
        return tuple([key, value]);
    } else {
        throw __builtins__.PY$KeyError("popitem(): dictionary is empty");
    }
};

/* 25-type-str.js                */
var basestring = __inherit(object, "basestring");
__builtins__.PY$basestring = basestring;
basestring.PY$__init__ = function(s) {
    if (s === undefined) {
        this.obj = '';
    } else if (typeof s === "string") {
        this.obj = s;
    } else if (s.toString !== undefined) {
        this.obj = s.toString();
    } else {
        this.obj = js(s);
    }
};
var __basestring_real__ = basestring.PY$__create__;
basestring.PY$__create__ = function(cls, obj) {
    if ($PY.isinstance(obj, basestring)) {
        return obj;
    } else if (obj.PY$__class__ === undefined && obj.PY$__super__ !== undefined) {
        return object.PY$__repr__.apply(obj);
    } else if (obj.PY$__str__ !== undefined) {
        return obj.PY$__str__();
    } else {
        return __basestring_real__(cls, obj);
    }
};
basestring.PY$__str__ = function () {
    if (this.PY$__class__) {
        return this;
    } else {
        return object.PY$__str__.apply(this);
    }
};
basestring.PY$__repr__ = function () {
    if (this.PY$__class__) {
        return this.PY$__class__("'" + this.obj + "'");
    } else {
        return object.PY$__repr__.apply(this);
    }
};
basestring._js_ = function () {
    return this.obj;
};
basestring.PY$__hash__ = function () {
    var value = this.obj.charCodeAt(0) << 7;
    var len = this.obj.length;
    for (var i = 1; i < len; i++) {
        value = ((1000003 * value) & 0xFFFFFFFF) ^ this.obj[i];
        value = value ^ len;
    }
    if (value === -1) {
        value = -2;
    }
    return value;
};
basestring.PY$__len__ = function() {
    return int(this.obj.length);
};
basestring.PY$__iter__ = function() {
    return iter(this.obj);
};
basestring.PY$__mod__ = function(args) {
    return basestring(sprintf(this, args));
};
basestring.PY$__eq__ = function(s) {
    if (this.PY$__class__ === undefined)
        return object.PY$__eq__.call(this, s);
    else if (typeof(s) === "string")
        return this.obj === s ? True : False;
    else if ($PY.isinstance(s, __builtins__.PY$basestring))
        return this.obj === s.obj ? True : False;
    else
        return False;
};
basestring.PY$__gt__ = function(s) {
    if (this.PY$__class__ === undefined)
        return object.PY$__gt__.call(this, s);
    else if (typeof(s) === "string")
        return this.obj > s ? True : False;
    else if ($PY.isinstance(s, __builtins__.PY$basestring))
        return this.obj > s.obj ? True : False;
    else if ($PY.isinstance(s, __builtins__.PY$tuple))
        return False;
    else
        return True;
};
basestring.PY$__lt__ = function(s) {
    if (this.PY$__class__ === undefined)
        return object.PY$__lt__.call(this, s);
    if (typeof(s) === "string")
        return this.obj < s ? True : False;
    else if ($PY.isinstance(s, __builtins__.PY$basestring))
        return this.obj < s.obj ? True : False;
    else if ($PY.isinstance(s, __builtins__.PY$tuple))
        return True;
    else
        return False;
};
basestring.PY$__contains__ = function(item) {
	if (this.obj.indexOf(item) != -1) {
		return True;
	}
    return False;
};
basestring.PY$__getitem__ = function(index) {
    var seq;
    index = js(index);
    if ($PY.isinstance(index, slice)) {
        var s = index;
        var inds = js(s.PY$indices(this.obj.length));
        var start = inds[0];
        var stop = inds[1];
        var step = inds[2];
        if (step != 1) {
            seq = "";
            for (var i = start; i < stop; i += step) {
                seq = seq + js(this.obj.charAt(i));
            }
            return this.PY$__class__(seq);
        } else {
            return this.PY$__class__(this.obj.slice(start, stop));
        }
    } else if ((index >= 0) && (index < this.obj.length))
        return this.obj.charAt(index);
    else if ((index < 0) && (index >= -this.obj.length))
        return this.obj.charAt(index + this.obj.length);
    else
        throw __builtins__.PY$IndexError("string index out of range");
};
basestring.PY$__setitem__ = function() {
    throw __builtins__.PY$TypeError("'str' object doesn't support item assignment");
};
basestring.PY$__delitem__ = function() {
    throw __builtins__.PY$TypeError("'str' object doesn't support item deletion");
};
basestring.PY$__mul__ = function(c) {
    if ($PY.isinstance(c, int)) {
        var max = js(c);
        var res = "";
        for (var i = 0; i < max; i++) {
            res += this.obj;
        }
        return basestring(res);
    } else {
        throw __builtins__.PY$TypeError(sprintf("Cannot multiply string and <%s>", c.PY$__class__.PY$__name__));
    }
};
basestring.PY$__add__ = function(c) {
    if ($PY.isinstance(c, basestring)) {
        return this.PY$__class__(this.obj + c.PY$__str__()._js_());
    } else {
        throw __builtins__.PY$TypeError(sprintf("Cannot add string and <%s>", c.PY$__class__.PY$__name__));
    }
};
basestring.PY$__iadd__ = basestring.PY$__add__;
basestring.PY$count = function(needle, start, end) {
    if (start === undefined) {
        start = 0;
    } else {
      start = js(start);
    }
    if (end === undefined)
        end = null;
    else
        end = js(end);
    var count = 0;
    var s = this.PY$__getitem__(slice(start, end));
    var idx = js(s.PY$find(needle));
    while (idx != -1) {
        count += 1;
        s = s.PY$__getitem__(slice(idx+1, null));
        idx = js(s.PY$find(needle));
    }
    return count;
};
basestring.PY$index = function(value, start, end) {
    if (start === undefined) {
        start = 0;
    }
    for (var i = js(start); (end === undefined) || (start < end); i++) {
        var _value = this.obj[i];
        if (_value === undefined) {
            break;
        }
        if (_value === value) {
            return int(i);
        }
    }
    throw __builtins__.PY$ValueError("substring not found");
};
basestring.PY$find = function(s) {
    return int(this.obj.indexOf(js(s)));
};
basestring.PY$rfind = function(s) {
    return int(this.obj.lastIndexOf(js(s)));
};
basestring.PY$join = function(s) {
    var res = "";
    var that = this;
    iterate(s, function(elm) {
                if (res != "")
                    res += that.obj;
                res += str(elm)._js_();
            });
    return str(res);
};
basestring.PY$format = function() {
    var self = this;
    var kwargs = __kwargs_get(arguments);
    var args = __varargs_get(arguments);
    var $v1 = Array.prototype.slice.call(arguments).concat(js(args));
    kwargs = dict(kwargs);
    args = tuple($v1.slice());
    var r = [];
    var i, c, string = js(self);
    var res = "";
    var c;
    var state = "string";
    var variable = '';
    var implicitCounter = 0;
    var numbered = null;
    var v;
    var opened = 0;
    string = string.split('').reverse();
    while (string.length) {
        c = string.pop();
        switch (state) {
            case "string":
                if (c === "{") {
                    state = "variable";
                    opened ++;
                } else {
                    res += c;
                }
                break;
            case "variable":
                if (c === "{") {
                    res += "{";
                    state = "string";
                } else if (c === "}") {
                    opened --;
                    if (opened !== 0) {
                        variable += c;
                        continue;
                    }
                    if (variable === '') {
                        if (numbered !== true) {
                            res += $v1[implicitCounter]
                            implicitCounter ++;
                            numbered = false;
                        } else {
                            throw __builtins__.PY$ValueError("cannot switch from manual field specification to automatic field numbering");
                        }
                    } else {
                        if (numbered !== false) {
                            numbered = true;
                            v = kwargs.PY$get(variable);
                            if (js(v)) {
                                res += v;
                            } else if ($v1.hasOwnProperty(variable)) {
                                res += $v1[variable];
                            } else {
                                throw "ERROR Not expected";
                            }
                        } else {
                            throw __builtins__.PY$ValueError("cannot switch from automatic field numbering to manual field specification");
                        }
                    }
                    variable = '';
                    state = "string";
                } else {
                    variable += c;
                }
                break;
        }
    }
    return py(res);
}
basestring.PY$replace = function(old, _new, count) {
    old = js(old);
    _new = js(_new);
    var old_s;
    var new_s;
    if (count !== undefined)
        count = js(count);
    else
        count = -1;
    old_s = "";
    new_s = this.obj;
    while ((count != 0) && (new_s != old_s)) {
        old_s = new_s;
        new_s = new_s.replace(old, _new);
        count -= 1;
    }
    return this.PY$__class__(new_s);
};
basestring.PY$lstrip = function(chars) {
    if (this.obj.length === 0)
        return this;
    if (chars !== undefined)
        chars = tuple(chars);
    else
        chars = tuple(["\n", "\t", " "]);
    var i = 0;
    while ((i < this.obj.length) && (js(chars.PY$__contains__(this.PY$__getitem__(i))))) {
        i += 1;
    }
    return this.PY$__getitem__(slice(i, null));
};
basestring.PY$rstrip = function(chars) {
    if (this.obj.length === 0)
        return this;
    if (chars !== undefined)
        chars = tuple(chars);
    else
        chars = tuple(["\n", "\t", " "]);
    var i = this.obj.length - 1;
    while ((i >= 0) && (js(chars.PY$__contains__(this.PY$__getitem__(i))))) {
        i -= 1;
    }
    return this.PY$__getitem__(slice(i+1));
};
basestring.PY$strip = function(chars) {
    return this.PY$lstrip(chars).PY$rstrip(chars);
};
basestring.PY$split = function(sep, max) {
    var r_new;
    if (sep === undefined) {
        var strings = this.obj.split(/\s+/);
        for (var x = 0; x < strings.length; x++) {
            strings[x] = str(strings[x]);
        };
        return list(strings);
    } else {
        sep = js(sep);
    }
    if (max === undefined) {
        max = 0xFFFFFFFF;
    } else {
        max = js(max);
        if (max === 0) {
            return list([this]);
        }
    }
    r_new = list();
    var i = -sep.length;
    var c = 0;
    var q = 0;
    while (c < max) {
        i = this.obj.indexOf(sep, i + sep.length);
        if (i === -1) {
            break;
        }
        r_new.PY$append(this.PY$__class__(this.obj.substring(q, i)));
        q = i + sep.length;
        c++;
    }
    r_new.PY$append(this.PY$__class__(this.obj.substring(q)));
    return r_new;
};
basestring.PY$splitlines = function() {
    return this.PY$split("\n");
};
basestring.PY$lower = function() {
    return this.PY$__class__(this.obj.toLowerCase());
};
basestring.PY$upper = function() {
    return this.PY$__class__(this.obj.toUpperCase());
};
basestring.PY$encode = function() {
    return this;
};
basestring.PY$decode = function() {
    return this;
};
basestring.PY$startswith = function(other) {
    return bool(this.obj.indexOf(js(other)) === 0);
};
basestring.PY$endswith = function(other) {
    var x = js(other);
    var i = this.obj.lastIndexOf(x);
    return (i !== -1 && i === (this.obj.length - x.length)) ? True : False;
};
var str = __inherit(basestring, "str");
var unicode = __inherit(basestring, "unicode");
__builtins__.PY$str = str;
__builtins__.PY$unicode = unicode;
unicode.PY$__create__ = function(cls, obj) {
    if (obj.PY$__unicode__ !== undefined) {
        return obj.PY$__unicode__();
    } else {
        return basestring.PY$__create__(cls, obj);
    }
};

/* 26-type-number.js             */
var number = __inherit(object, "number");
__builtins__.number = number;
number.PY$__repr__ = number.PY$__str__;
number.PY$__eq__ = function (other) {
    if (typeof(other) === "number") {
        return this.obj === other ? True : False;
    } else if (other.numbertype) {
        return this.obj === other.obj ? True : False;
    } else if (other[this.numbertype] !== undefined) {
        return this.obj === other[this.numbertype]()._js_() ? True : False;
    } else {
        return object.PY$__eq__.call(this, other);
    }
};
number.toString = function () {
    return js(this.PY$__str__());
};
number._js_ = function () {
    return this.obj;
};
number.PY$__pos__ = function() {
    return this.PY$__class__(+this.obj);
};
number.PY$__abs__ = function() {
    return this.PY$__class__(Math.abs(this.obj));
};
number.PY$__neg__ = function() {
    return this.PY$__class__(-this.obj);
};
number.PY$__nonzero__ = function() {
    return this.obj != 0 ? True : False;
};
number.PY$__gt__ = function(x) {
    if (this.PY$__class__ === undefined) {
        return object.PY$__gt__.call(this, x);
    } else if (x.numbertype) {
        return this.obj > x.obj ? True : False;
    } else if (x[this.numbertype] !== undefined) {
        return this.obj > x[this.numbertype]()._js_() ? True : False;
    } else {
        return object.PY$__gt__.call(this, x);
    }
};
number.PY$__lt__ = function(x) {
    if (this.PY$__class__ === undefined) {
        return object.PY$__lt__.call(this, x);
    } else if (x.numbertype) {
        return this.obj < x.obj ? True : False;
    } else if (x[this.numbertype] !== undefined) {
        return this.obj < x[this.numbertype]()._js_() ? True : False;
    } else {
        return object.PY$__lt__.call(this, x);
    }
};
number.PY$__mul__ = function(x) {
    if (x.numbertype === undefined) {
        if (x.PY$__int__ !== undefined) {
            return this.numberclass(this.obj * x.PY$__int__()._js_());
        } else if ($PY.isinstance(x, [basestring, list, tuple])) {
            return x.PY$__mul__(this);
        } else {
            throw __builtins__.PY$TypeError("Cannot multiply number and non-number");
        }
    } else if ((this.numbertype === 'PY$__float__') || (x.numbertype !== 'PY$__float__')) {
        return this.numberclass(this.obj * x.obj);
    } else {
        return x.numberclass(this.obj * x.obj);
    }
};
number.PY$__add__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot add number and non-number");
    if ((this.numbertype === 'PY$__float__') || (x.numbertype !== 'PY$__float__'))
        return this.numberclass(this.obj + x.obj);
    else
        return x.numberclass(this.obj + x.obj);
};
number.PY$__div__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot divide number and non-number");
    if ((this.numbertype === 'PY$__float__') || (x.numbertype !== 'PY$__float__'))
        return this.numberclass(this.obj / x.obj);
    else
        return x.numberclass(this.obj / x.obj);
};
number.PY$__sub__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot subtract number and non-number");
    if ((this.numbertype === 'PY$__float__') || (x.numbertype !== 'PY$__float__'))
        return this.numberclass(this.obj - x.obj);
    else
        return x.numberclass(this.obj - x.obj);
};
number.PY$__pow__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot exponentiate number and non-number");
    if ((this.numbertype === 'PY$__float__') || (x.numbertype !== 'PY$__float__'))
        return this.numberclass(Math.pow(this.obj, x.obj));
    else
        return x.numberclass(Math.pow(this.obj, x.obj));
};
number.PY$__imul__      = number.PY$__mul__;
number.PY$__iadd__      = number.PY$__add__;
number.PY$__idiv__      = number.PY$__div__;
number.PY$__isub__      = number.PY$__sub__;
number.PY$__ipow__      = number.PY$__pow__;

/* 28-type-none.js               */
var none = __inherit(object, "NoneType");
none.PY$__init__ = function() {
    this.obj = null;
};
none.PY$__str__ = function () {
    return str("None");
};
none.PY$__repr__ = none.PY$__str__;
none.PY$__eq__ = function (other) {
    if (other.PY$__class__ !== this.PY$__class__) {
        return False;
    } else if (other === null) {
        return True;
    } else {
        return this.obj === other.obj ? True : False;
    }
};
none._js_ = function () {
    return this.obj;
};
none.PY$__nonzero__ = function() {
    return False;
};
var None = none();
__builtins__.PY$None = None;
none.PY$__create__ = function() {
    return None;
};

/* 29-type-float.js              */
var float = __inherit(number, "float");
__builtins__.PY$float = float;
float.numbertype = "PY$__float__";
float.numberclass = float;
float.PY$__init__ = function(value) {
    var s = str(value)._js_();
    if (s.match(/^[-+]?[0-9]+(\.[0-9]*)?(e[-+]?[0-9]+)?$/)) {
        this.obj = parseFloat(s);
    } else {
        throw __builtins__.PY$ValueError("Invalid float: " + s);
    }
};
var __float_real__ = float.PY$__create__;
float.PY$__create__ = function(cls, obj) {
    if (js($PY.isinstance(obj, object)) && (obj.PY$__float__ !== undefined)) {
        return obj.PY$__float__();
    } else {
        return __float_real__(cls, obj);
    }
};
float.PY$__float__ = function () {
    return this;
};
float.PY$__int__ = function () {
    return int(parseInt(this.obj));
};
float.PY$__str__ = function () {
    if (this.obj - Math.floor(this.obj) < 1e-6) {
        var res = sprintf("%g", this);
        if (res.indexOf('e') === -1) {
            return str(res + ".0");
        } else {
            return str(res);
        }
    } else {
        return str(sprintf("%.10g", this));
    }
};
float.PY$__repr__ = float.PY$__str__;
float.PY$__hash__ = function () {
    return this.obj;
};
float.PY$__div__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot divide number and non-number");
    if (x.obj === 0)
        throw __builtins__.PY$ZeroDivisionError("float division by zero");
    return float((0.0 + this.obj) / (0.0 + x.obj));
};
float.PY$__pow__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot exponentiate number and non-number");
    return float(Math.pow(this.obj, x.obj));
};
float.PY$__floordiv__ = float.PY$__div__;
float.PY$__ifloordiv__ = float.PY$__div__;

/* 30-type-int.js                */
var int = __inherit(number, "int");
__builtins__.PY$int = int;
int.numbertype = "PY$__int__";
int.numberclass = int;
int.PY$__init__ = function(value) {
    if (arguments.length === 2) {
        this.obj = parseInt(i, arguments[1]);
    } else {
        var s = js(str(value));
        if (s.match(/^[-+0-9]+$/)) {
            this.obj = parseInt(s, 10);
        } else {
            throw __builtins__.PY$ValueError("Invalid integer: " + value);
        }
    }
};
var __int_real__ = int.PY$__create__;
int.PY$__create__ = function(cls, obj) {
    if (js($PY.isinstance(obj, object)) && (obj.PY$__int__ !== undefined)) {
        return obj.PY$__int__();
    } else {
        return __int_real__(cls, obj);
    }
};
int.PY$__int__ = function () {
    return this;
};
int.PY$__float__ = function () {
    return float(this.obj);
};
int.PY$__str__ = function () {
    return str(this.obj);
};
int.PY$__repr__ = int.PY$__str__;
int.PY$__hash__ = function () {
    return this.obj;
};
int.PY$__invert__ = function() {
    return int(~this.obj);
};
int.PY$__div__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot divide int and non-int");
    if (x.obj === 0)
        throw __builtins__.PY$ZeroDivisionError("integer division or modulo by zero");
    var res = this.obj / x.obj;
    return float(res);
};
int.PY$__floordiv__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    if (x.obj === 0)
        throw __builtins__.PY$ZeroDivisionError("integer division or modulo by zero");
    if (x.numbertype === "PY$__float__") {
        return float(this.obj / x.obj);
    } else {
        return int(Math.floor(this.obj / x.obj));
    }
};
int.PY$__mod__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot find remainder of int and non-int");
    return int(this.obj % x.obj);
};
int.PY$__pow__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot exponentiate int and non-int");
    if (x.numbertype === "PY$__float__") {
        return float(Math.pow(this.obj, x.obj));
    } else {
        return int(Math.floor(Math.pow(this.obj, x.obj)));
    }
};
int.PY$__bitand__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    return int(this.obj & x.obj);
};
int.PY$__bitor__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    return int(this.obj | x.obj);
};
int.PY$__bitxor__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    return int(this.obj ^ x.obj);
};
int.PY$__lshift__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    return int(this.obj << x.obj);
};
int.PY$__rshift__ = function(x) {
    if (!x.numbertype)
        throw __builtins__.PY$TypeError("Cannot operate on int and non-int");
    return int(this.obj >> x.obj);
};
int.PY$__idiv__      = int.PY$__div__;
int.PY$__ilshift__   = int.PY$__lshift__;
int.PY$__irshift__   = int.PY$__rshift__;
int.PY$__ibitand__   = int.PY$__bitand__;
int.PY$__ibitor__    = int.PY$__bitor__;
int.PY$__ibitxor__   = int.PY$__bitxor__;
int.PY$__ifloordiv__ = int.PY$__floordiv__;
var $cn1 = int(-1);
var $c0 = int(0);
var $c1 = int(1);
var $c2 = int(2);
var $c3 = int(3);
var $c4 = int(4);
var $c5 = int(5);
var $c6 = int(6);
var $c7 = int(7);
var $c8 = int(8);
var $c9 = int(9);

/* 31-type-bool.js               */
var bool = __inherit(int, "bool");
__builtins__.PY$bool = bool;
bool.PY$__init__ = function(b) {
    if (b) {
        this.obj = 1;
    } else {
        this.obj = 0;
    }
};
bool.PY$__str__ = function () {
    if (this.obj) {
        return str("True");
    } else {
        return str("False");
    }
};
bool.toString = function () {
    if (this.obj) {
        return "1";
    } else {
        return "";
    }
};
bool.PY$__repr__ = bool.PY$__str__;
bool.PY$__eq__ = function (other) {
    if (other.PY$__int__ !== undefined)
        return Number(this.obj) === other.PY$__int__()._js_() ? True : False;
    return this.obj === other.obj ? True : False;
};
bool._js_ = function () {
    if (this.obj) {
        return true;
    } else {
        return false;
    }
};
bool.PY$__neg__ = function() {
    return this.obj ? False : True;
};
bool.PY$__nonzero__ = function() {
    return this.obj ? True : False;
};
bool.PY$__int__ = function() {
    if (this.obj) {
        return $c1;
    } else {
        return $c0;
    }
};
var True = bool(true);
var False = bool(false);
__builtins__.PY$True = True;
__builtins__.PY$False = False;
bool.PY$__create__ = function(cls, b) {
    if (b === null || b === undefined) {
        return False;
    } else if (b.PY$__nonzero__ != undefined) {
        return b.PY$__nonzero__();
    } else if (b.PY$__len__ != undefined) {
        return b.PY$__len__().PY$__gt__($c0);
    } else if (b instanceof Array) {
        if (b.length) {
            return True;
        } else {
            return False;
        }
    } else if (typeof b === 'object') {
        for (var i in b) {
            return True;
        }
        return False;
    } else {
        if (!!b) {
            return True;
        } else {
            return False;
        }
    }
};

/* 60-string-format.js           */
function sprintf(obj, args) {
    var get_argument = function() {
        if (flag_name) {
            return args.PY$__getitem__(flag_name);
        } else {
            return args.PY$__getitem__(argc++);
        }
    };
    var fixed_digits = function(num, digits) {
        if (digits > 0 && digits < num.length) {
            if (num.charAt(digits) >= "5") {
                return num.substring(0, digits-1) + (parseInt(num.charAt(digits-1)) + 1).toString();
            } else {
                return num.substring(0, digits);
            }
        } else {
            return num;
        }
    };
    var format_float = function(num, defprec, prec) {
        if (prec < 1) {
            prec = defprec;
        }
        var parts = num.toFixed(prec+1).split(".");
        if (prec > defprec) {
            return parts[0] + "." + parts[1].substring(0, prec);
        } else {
            return parts[0] + "." + fixed_digits(parts[1], prec);
        }
    };
    var format_exp = function(num, expchar, defprec, prec, drop_empty_exp) {
        var parts = num.toExponential(defprec).split("e");
        if (parts[1].length < 3) {
            parts[1] = parts[1].charAt(0) + "0" + parts[1].substring(1);
        }
        if (prec) {
            var decparts = parts[0].split(".");
            decparts[1] = fixed_digits(decparts[1], prec);
            parts[0] = decparts[0] + "." + decparts[1];
        }
        if (drop_empty_exp && parts[1] === "+00") {
            return parts[0];
        } else {
            return parts[0] + expchar + parts[1];
        }
    };
    var trim_trailing_zeroes = function(s) {
        var i = s.length - 1;
        while (s.charAt(i) === '0') {
            i--;
        }
        s = s.substr(0, i + 1);
        if (s.charAt(s.length - 1) === '.') {
            s = s.substr(0, s.length - 1);
        }
        return s;
    };
    var s = js(obj);
    var i = 0;
    var res = "";
    var argc = 0;
    var si;
    if ($PY.isinstance(args, [dict, list, tuple]) === false) {
        args = tuple([args]);
    }
    while (i < s.length) {
        si = s.charAt(i);
        if (si === "%") {
            if (++i === s.length) {
                throw __builtins__.PY$ValueError("Incomplete format");
            }
            var flag_zero  = false;
            var flag_minus = false;
            var flag_hash  = false;
            var flag_plus  = false;
            var flag_space = false;
            var flag_len   = 0;
            var flag_len2  = 0;
            var subres     = null;
            var prefix     = "";
            var has_sign  = false;
            var flag_name  = null;
            while (i < s.length) {
                si = s.charAt(i);
                if (si === "0") {
                    flag_zero = true;
                } else if (si === "-") {
                    flag_minus = true;
                } else if (si === "#") {
                    flag_hash = true;
                } else if (si === "0") {
                    flag_zero = true;
                } else if (si === " ") {
                    flag_space = true;
                } else if (si === "+") {
                    flag_space = false;
                    flag_plus  = true;
                } else if (si > "0" && si <= "9") {
                    flag_len = "";
                    while (si >= "0" && si <= "9") {
                        flag_len += si;
                        si = s.charAt(++i);
                    }
                    flag_len = Number(flag_len);
                    i--;
                } else if (si === ".") {
                    si = s.charAt(++i);
                    while (si >= "0" && si <= "9") {
                        flag_len2 += si;
                        si = s.charAt(++i);
                    }
                    flag_len2 = Number(flag_len2);
                    i--;
                } else if (si === "(") {
                    flag_name = "";
                    while (i++ < s.length) {
                        si = s.charAt(i);
                        if (si === ")") {
                            break;
                        }
                        flag_name += si;
                    }
                } else if (si === "%") {
                    subres = "%";
                } else if (si === "d" || si === "i" || si === "u") {
                    has_sign = true;
                    subres = js(int(get_argument())).toString();
                } else if (si === "s") {
                    subres = js(get_argument().PY$__str__());
                } else if (si === "r") {
                    subres = js(get_argument().PY$__repr__());
                } else if (si === "f" || si === "F") {
                    has_sign = true;
                    subres = format_float(js(get_argument().PY$__float__()), 6, flag_len2);
                } else if (si === "e" || si === "E") {
                    has_sign = true;
                    var expchar = si;
                    subres = format_exp(js(get_argument().PY$__float__()), expchar, 6, flag_len2, false);
                } else if (si === "g" || si === "G") {
                    has_sign = true;
                    var arg = js(get_argument().PY$__float__());
                    var val = flag_len2;
                    if (val === 0)
                        val = 6;
                    if (arg === 0 && !flag_hash) {
                        subres = "0";
                    } else if (arg < 0.0001 || arg.toFixed().split(".")[0].length > val) {
                        expchar = "e";
                        if (si === "G")
                            expchar = "E";
                        subres = format_exp(arg, expchar, 5, flag_len2-1, true);
                        if (!flag_hash) {
                            var parts = subres.split(expchar);
                            subres = trim_trailing_zeroes(parts[0]);
                            if (parts[1]) {
                                subres += expchar + parts[1];
                            }
                        }
                    } else {
                        subres = format_float(arg, 5, flag_len2-1);
                        if (!flag_hash) {
                            subres = trim_trailing_zeroes(subres);
                        }
                    }
                } else if (si === "o") {
                    has_sign = true;
                    subres = js(get_argument().PY$__int__()).toString(8);
                    if (flag_hash && subres.charAt(0) !== "0")
                        prefix = "0";
                } else if (si === "x") {
                    has_sign = true;
                    if (flag_hash)
                        prefix = "0x";
                    subres = js(get_argument().PY$__int__()).toString(16);
                } else if (si === "X") {
                    has_sign = true;
                    if (flag_hash)
                        prefix = "0X";
                    subres = js(get_argument().PY$__int__()).toString(16).toUpperCase();
                } else {
                    throw __builtins__.PY$ValueError("Unsupported format character '" + si + "' at index " + String(i));
                }
                i++;
                if (subres != null)
                    break;
            }
            var pad_char = " ";
            if (flag_zero)
                pad_char = "0";
            var sign = "";
            if (has_sign) {
                if (subres.charAt(0) === "-" || subres.charAt(0) === "+") {
                    sign = subres.charAt(0);
                    subres = subres.substring(1);
                } else if (flag_plus) {
                    sign = "+";
                }
            }
            if (flag_space) {
                prefix = " " + prefix;
            }
            if (pad_char === " x") {
                prefix = sign + prefix;
                sign = "";
            }
            var pad = "";
            for (var c = sign.length + prefix.length + subres.length; c < flag_len; c++)
                pad = pad + pad_char;
            if (flag_minus) {
                res += sign + prefix + subres + pad;
            } else {
                if (flag_zero) {
                    res += sign + pad + prefix + subres;
                } else {
                    res += pad + sign + prefix + subres;
                }
            }
         } else {
             res += si;
             i++;
        }
    }
    return res;
}

/* 70-module-init.js             */
__builtins__ = module("__builtins__", "(built-in)", __builtins__);