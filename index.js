require('dotenv').config()
let {
    RPC_URL,
    TOKEN_ADDRESS,
    FROM_BLOCK,
    TO_BLOCK, 
    BLOCK_INTERVAL,
    TOKEN_DECIMALS
} = process.env
const Web3 = require('web3')
const { toWei } = require('web3-utils')
const ERC20_ABI = require('./ERC20.abi.json')
const BN = require('bignumber.js')
BLOCK_INTERVAL = Number(BLOCK_INTERVAL)
TO_BLOCK = Number(TO_BLOCK)
FROM_BLOCK = Number(FROM_BLOCK)
const web3 = new Web3(RPC_URL)

async function main() {
  let addresses = {}
  return new Promise(async (resolve, reject) => {
    console.log(RPC_URL, TOKEN_ADDRESS)
    const token = new web3.eth.Contract(ERC20_ABI, TOKEN_ADDRESS)
    for(let i = FROM_BLOCK; i <= TO_BLOCK; i=i+BLOCK_INTERVAL) {
      console.log(`from ${i} to ${i+BLOCK_INTERVAL}`)
      const events = await token.getPastEvents('Transfer', {
        fromBlock: i,
        toBlock: i+BLOCK_INTERVAL
      })
      for( event of events ) {
        const {from, to, value} = event.returnValues
        try {
          addresses[to] = BN(addresses[to] || 0).plus(value.toString(10)).toFixed()
          addresses[from] = BN(addresses[from] || 0).minus(value.toString(10)).toFixed()
        } catch(e) {
          console.error(e)
        }
  
      }
    }
    addresses = Object.entries(addresses).filter(([address, value]) => !BN(value).isZero() )
    let total = addresses.reduce((totalValue, [address, value]) => {
      totalValue = BN(value).plus(totalValue)
      return totalValue
    }, BN(0))
    const prepareArray = addresses.map(([address, value]) => {
      return {ethAccount: address, value}
    })
    console.log(prepareArray)
    total = total.div(BN(10).pow(TOKEN_DECIMALS))
    console.log('Total holders:', prepareArray.length, 'Total balance', total.toFormat())
    resolve()

  })

}

async function run() {
  await main()
}

run()
