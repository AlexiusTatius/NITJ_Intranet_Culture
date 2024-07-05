1. Shall I simply write app.use(cors())? or shall I create a whole object like below?, 
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
```

2. 