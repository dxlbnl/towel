
from pyjaco import Compiler

from os import path
import imp, ast

"""
When a module named spam is imported, the interpreter first searches for a built-in module with that name. 
If not found, it then searches for a file named spam.py in a list of directories given by the variable sys.path. 
sys.path is initialized from these locations:

 - the directory containing the input script (or the current directory).
 - PYTHONPATH (a list of directory names, with the same syntax as the shell variable PATH).
 - the installation-dependent default.
 - After initialization, Python programs can modify sys.path. The directory containing the script being run is placed at the beginning of the search path, ahead of the standard library path. This means that scripts in that directory will be loaded instead of modules of the same name in the library directory. This is an error unless the replacement is intended. See section Standard Modules for more information.
"""


# Start off with only importing the files relative to the input script


search_paths = ['.']

class DependencyFinder(ast.NodeVisitor):
    """Searches a module node for import statements."""
    
    def __init__(self):
        self.imports = set()
        
    def visit_ImportFrom(self, node):
        # level means the relative level (how many folders up)
        
        module = node.module
        for alias in node.names:
            self.imports.add(module + '.' + alias.name)
            
    def visit_Import(self, node):
        for alias in node.names:
            self.imports.add(alias.name)

def load_module(name, origin='', asname=None, watch=None):
    
    if origin:
        location = origin + '.' + name
    else:
        location = name
        
    file, pathname, description = imp.find_module(location.replace('.', '/'), search_paths)
    
    if file:
        # its a module
        code = file.read()
        file.close()
        
        # add watch when supplied
        if watch:
            watch(file.name)
        
        if asname:
            location = asname
        
        return Module(location, name, code)
    else:
        # its a package
        init = load_module("__init__", origin=name, asname=name, watch=watch)
        return Package(location, name, init)
    raise ImportError("No module named {}".format(name))

class Module:
    def __init__(self, fullname, name, code):
        
        self.fullname = fullname
        self.name = name
        self.code = code
        self.ast  = ast.parse(self.code)
        
        # visit the node, and look for the dependencies
        f = DependencyFinder()
        f.visit(self.ast)    
        
        #print "Loading module:", name
        #print "\t > dependencies", f.imports
        self.requires = f.imports
        
    def __repr__(self):
        r = ["Module '{name}:{asname}':".format(name=self.name, asname=self.fullname)]
        r.extend(['    ' + s for s in self.requires])
        if not self.requires:
            r.extend(["    None"])
        
        return '\n'.join(r)
        
    def search(self, name):
        return False
        
    def compile(self):
        c = Compiler()
        c.append_raw(c.compile_module(self.code, 'test.py', name=self.fullname))
        
        return str(c)
    
    def getModules(self):
        return [self]

class Package:
    def __init__(self, fullname, name, init):
        self.fullname = fullname
        self.name = name
        self.init = init
        
        self.modules = {}
        
        
    def __repr__(self):
        
        contents = repr(self.init).split('\n')
        [contents.extend(repr(self.modules[mod]).split('\n')) for mod in self.modules] 
        
        contents = ['    '+c for c in contents]
        
        return "Package '{name}':\n{contents}".format(name=self.name, contents='\n'.join(contents))
        
    @property
    def requires(self):
        r = self.init.requires
        for m in self.modules:
            r.update(self.modules[m].requires)
        
        return r
        
    def add(self, name, module):
        n = name.split('.', 1)
        
        if n[0] in self.modules:
            self.modules[n[0]].add(n[1], module)
        else:
            self.modules[n[0]] = module
            
    def search(self, name):
        """Returns the module if exists"""
        if '.' in name:
            mod, rest = name.split('.', 1)
        else:
            mod, rest = name, None
        
        m = self.modules.get(mod, None)
        
        if rest:
            return m.search(rest)
        else:
            return m
        
        return None
        
    def getModules(self):
        # recursivly gets all modules ( a list)
        res = [self.init]
        for m in self.modules.values():
            res.extend(m.getModules())
            
        return res
        
        
    def compile(self):
        return self.init.compile()

def makeDependencyTree(module, asname="__main__", watch=None):
    done = set()
    known = set([module])
    todo = known
    
    modules = {}
    
    while todo:
        current = todo.pop()
        
        #for each dot check if the module is known, otherwise append that module.
        splitted = current.split('.')
        root_module = splitted[0]
        
        tosearch = ['.'.join(splitted[1:i]) for i in range(2, len(splitted)+1)]
        
        mod = modules.get(root_module, None)
        if not mod:
            #Get module.
            if asname:
                mod = load_module(root_module, asname=asname, watch=watch)
            else:
                mod = load_module(root_module, watch=watch)
                
            done.add(root_module)
            modules[root_module] = mod
        
        while tosearch:
            n = tosearch.pop(0)
            m = mod.search(n)
            
            if m:
                continue
            elif m == None:
                # add the module
                try:
                    mod.add(n, load_module(root_module + '.' + n, watch=watch))
                    done.add(root_module + '.' + n)
                except ImportError:
                    # it's probably no module
                    #print "Skipping", root_module + '.' + n
                    done.add(root_module + '.' + n)
            else:
               # it is not a module probably, but a function
                done.add(root_module + '.' + n)
                
        # calculate what is to be done.
        for mod in modules.itervalues():
            known.update(mod.requires)
        
        #update todo
        todo = known.difference(done)
        
        
    return modules
    


