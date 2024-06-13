const { expect } = require('chai');
const { ethers } = require('hardhat');

const itemDescribe = 'This is great spher';
const duration = 60;

describe("AucEngine", () => {
  let owner, buyer, seller, auct, tx, cAuction;

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners()

    const AucEngine = await ethers.getContractFactory("AucEngine", owner);
    auct = await AucEngine.deploy();
    await auct.waitForDeployment(); 

    tx = await auct.connect(seller).createAuction(
      ethers.parseEther('0.0001'),
      3,
      itemDescribe,
      duration
    );
    cAuction = await auct.auctions(0);
  })

  it('sets owner', async () => {
    const currentOwner = await auct.owner();

    expect(currentOwner).to.eq(owner.address)
  })

  const getTimestamp = async (
    bn
  ) => (await ethers.provider.getBlock(bn)).timestamp;
  const delay = (
    ms
  ) => new Promise(resolve => setTimeout(resolve, ms)); // моэно просто отработать через setTimeout

  const setBuyTransaction = () => auct
    .connect(buyer).buy(
      0,
      { value: ethers.parseEther('0.0001')},
    );


  describe('createAuction', async () => {
    it('create auction correctly', async () => {  
      expect(cAuction.item).to.eq(itemDescribe);

      const ts = await getTimestamp(tx.blockNumber);
      expect(cAuction.endsAt).to.eq(ts + duration);
    })
    it("check buy function", async () => {
      await delay(2000);
      
      const buyTx = await setBuyTransaction();

      cAuction = await auct.auctions(0);
      const finalPrice = Number(cAuction.finalPrice);
      const currentPrice = finalPrice - Math.floor(((finalPrice * 10) / 100));
      await expect(() => buyTx).to.changeEtherBalance(
        seller,
        currentPrice
      );

      // проверка на отправку события
      await expect(buyTx)
        .to.emit(auct, 'AuctionEnded')
        .withArgs(0, finalPrice , buyer.address);

      await expect(setBuyTransaction())
        .to.be.revertedWith('Stopped!');
    })
  })
})