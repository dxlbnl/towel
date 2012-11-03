
def partial(f, *partial_args, **partial__kwargs):
    """Takes a function f and some arguments, and returns a function with those arguments supplied"""
    def func(*args, **kwargs):
        kwargs.update(partial_kwargs)
        arguments = partial_args + args
        f(*arguments, **kwargs)
        
    return func