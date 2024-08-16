### Prevent Overflow
1. use checked_add, checked_sub, checked_mul, checked_div, checked_rem
```rust
// this results in overflow:
let a = 255 + 1;
println!("a: {}", a);

// this results in None:
let a = 255.checked_add(1);
match a {
    Some(v) => println!("a: {}", v),
    None => println!("overflow"),
}
```