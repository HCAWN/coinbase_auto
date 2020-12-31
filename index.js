const {CoinbasePro} = require('coinbase-pro-node');
const {CONFIG_COINBASE_API_KEY,CONFIG_COINBASE_API_SECRET,CONFIG_COINBASE_PASSPHRASE} = require('./credentials')

const auth = {
    apiKey: CONFIG_COINBASE_API_KEY,
    apiSecret: CONFIG_COINBASE_API_SECRET,
    passphrase: CONFIG_COINBASE_PASSPHRASE,
};

// api key realies on IP whitelisting, so you may get a 401 if using a new IP address not whitelisted via Coinbase.
const client = new CoinbasePro(auth);


client.rest.account.listAccounts()
.then(accounts => {
    const accountGBP = accounts.find(account => account.currency === 'GBP');
    // check if more than £0.01 in GBP
    if (accountGBP.balance > 0.01) {
        // execute trade to btc
        const buyOrder = {
            product_id: 'BTC-GBP',
            side: 'buy',
            type: 'market',
            funds: parseFloat(parseFloat(accountGBP.balance).toFixed(2)) //they send a string, so converting to float, then to two decimal places, then back to float
        };
        client.rest.order.placeOrder(buyOrder)
        .then(async (msg) => { 
            console.log("BUY SUCCESS", msg) 
        })
        .catch(error => { console.log("ERROR ON BUY", error) });
    } else if (accountGBP.hold > 0.01) {
        console.log(`${accountGBP.hold} is in hold for now, try again shortly`);
    }
    else {
        console.log('less than £0.01 in account, not buying');
    }
})
.catch(error => {
    console.log(error);
});