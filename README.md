Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

## Build
  sh build.sh
  
### Quick examples
```
function eventHandler(){
    (root) => {
      root.assign({a: undefined, b: false})
      root.a // undefined
      root.b // [object Branch]
      !!root.b //true
      !!root.a //false
      !!root.b.state //false
    }
}
```