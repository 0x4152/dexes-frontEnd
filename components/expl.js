import { useState } from "react"

export default function Explanation({
    setShowExp,
    showExp,
    ethReserves,
    tokenReserves,
    DexAddress,
}) {
    const DexAddressString = DexAddress.toString()
    const url = "https://goerli.etherscan.io/address/" + DexAddressString + ""
    const [showMath, setShowMath] = useState(true)
    const [showText, setShowText] = useState(false)

    function ethToTokensBoughtCalculation(tokenAmountExample) {
        let msgValue = tokenAmountExample

        let tokenBalance = tokenReserves
        let ethBalance = ethReserves
        let initialEthReserves = ethBalance
        let input_with_fee = msgValue * 997
        let numerator = tokenBalance * input_with_fee
        let denominator = initialEthReserves * 1000 + input_with_fee
        let tokensBought = numerator / denominator
        return parseFloat(Number(tokensBought).toFixed(3))
    }
    return (
        <div>
            {showExp ? (
                <div className="w-full max-w-screen min-h-4xl hover:bg-slate-300">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className="mb-4">
                            <div className="flex items-center justify-between m-2"></div>{" "}
                            <div>
                                <button
                                    onClick={() => setShowExp(0)}
                                    class="m-2 inline-block border border-blue-400 rounded bg-white  hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                                    href="#"
                                >
                                    Hide
                                </button>
                                <div className="text-xl">
                                    <p className="text-left text-gray-500  m-5">
                                        <p className="text-left text-gray-500  my-5 font-bold">
                                            Liquidity Pool:
                                        </p>{" "}
                                        A liquidity pool is a smart contract that holds two assets
                                        to facilitate exchanges between these assets in a
                                        decentralized manner. This liquidity pool is based on the
                                        Uniswap V1 protocol, which facilitates exchanges between ETH
                                        and ERC20 tokens.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        Its a way of bypassing a traditional order-book exchange
                                        system, where buyers are matched with sellers to facilitate
                                        exhanges. This kind of system isn't optimal for a
                                        decentralized platform, therefore we use a system that
                                        leverages math and market participants to give a fair market
                                        value to anyone that desires to trade a pair of assets,
                                        without relying on external parties.
                                    </p>
                                    <p className="m-5 text-violet-500 hover:text-violet-800 ">
                                        <a href={url}>Check the contract at {DexAddress}</a>
                                    </p>
                                    <p className="text-left text-gray-500  m-5 font-bold">
                                        Constant Product:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        The code of the liquidity pool smart contract leverages a
                                        "constant product" market making formula. Traders can swap
                                        between the two assets in either direction by adding to the
                                        liquidity reserve of one and withdrawing from the reserve of
                                        the other.
                                    </p>
                                    {!showMath ? (
                                        <div className="bg-pink-500 rounded-xl justify-center ">
                                            {" "}
                                            <button
                                                onClick={() => setShowMath(1)}
                                                class="m-3 inline-block border border-fuchsia-400 rounded bg-white  hover:border-gray-200 text-fuchsia-500 hover:bg-gray-200 py-1 px-3"
                                                href="#"
                                            >
                                                Hide math
                                            </button>
                                            <div className="flex justify-center">
                                                <p className="text-center text-3xl text-bold m-9 text-white">
                                                    {" "}
                                                    y * x = k
                                                </p>
                                            </div>
                                            <p className="text-center  text-bold m-5 text-white">
                                                {" "}
                                                Where y and x represent the two reserves to be
                                                traded with, and k represents a constant that is
                                                mantained.
                                            </p>
                                            <p className="text-center  text-bold m-9 text-white">
                                                {" "}
                                                We can also represent this formula as:
                                            </p>{" "}
                                            <div className="flex justify-center">
                                                <p className="text-center text-3xl text-bold m-9 text-white">
                                                    {" "}
                                                    y * x = y' * x'
                                                </p>
                                            </div>
                                            <div className="flex-auto container ">
                                                <p className="text-center  text-bold m-10 text-white min-w-max align-middle">
                                                    {" "}
                                                    y' and x' being the new values that the
                                                    liquidity pool will hold after a trade while
                                                    mantaining the constant.
                                                </p>{" "}
                                                <p className="text-center  text-bold m-10 text-white min-w-max align-middle">
                                                    {" "}
                                                    If we were to trade asset x for asset y, x'
                                                    would represent the reserves of asset x after
                                                    the transfer, therefore a larger amount than x.
                                                </p>{" "}
                                                <p className="text-center  text-bold m-10 text-white min-w-max align-middle">
                                                    {" "}
                                                    Furthermore, y' would represent the reserves of
                                                    asset y after the trade, and therefore it will
                                                    be smaller than y.
                                                </p>{" "}
                                                <p className="text-center  text-bold m-10 text-white min-w-max align-middle">
                                                    {" "}
                                                    Since we added asset x to the pool, we will need
                                                    to extract enough of asset y from the pool so
                                                    that the contant k is mantained.
                                                </p>{" "}
                                            </div>
                                            <div className="my-32">
                                                <div className="m-12 flex justify-between">
                                                    <div className="">
                                                        <p className="text-left text-xl text-bold m-3 text-white min-w-max ">
                                                            {" "}
                                                            x + a = x'
                                                        </p>
                                                    </div>
                                                    <p className="text-center  text-bold m-3 text-white min-w-max">
                                                        {" "}
                                                        We can define the resulting reserves of x,
                                                        or x' as the initial reserves plus the
                                                        amount we are exchanging.
                                                    </p>{" "}
                                                </div>
                                                <div className="m-12 flex justify-between">
                                                    <div className="">
                                                        <p className="text-left  text-bold m-3 text-white min-w-max ">
                                                            {" "}
                                                            y - b = b'
                                                        </p>
                                                    </div>
                                                    <p className="text-center  text-bold m-5 text-white">
                                                        {" "}
                                                        We can also define the resulting reserves of
                                                        y, or y' as the initial reserves minus the
                                                        amount we are getting in exchange.
                                                    </p>{" "}
                                                </div>
                                                <div className="m-12 flex justify-between">
                                                    <div className="">
                                                        <p className="text-left text-xl text-bold m-3 text-white min-w-max ">
                                                            {" "}
                                                            (x + a)*(y - b) = k
                                                        </p>
                                                    </div>
                                                    <p className="text-center  text-bold m-5 text-white">
                                                        {" "}
                                                        We therefore can arrive to the formula that
                                                        mantains the constant k reprented by x' * y'
                                                    </p>{" "}
                                                </div>
                                                <div className="m-12 flex justify-between">
                                                    <div className="">
                                                        <p className="text-left text-xl text-bold m-3 text-white min-w-max ">
                                                            {" "}
                                                            b = (y * a) / (x + a)
                                                        </p>
                                                    </div>
                                                    <p className="text-center  text-bold m-5 text-white">
                                                        {" "}
                                                        Solving to b we obtain the resulting formula
                                                        that takes into consideration the initial
                                                        reserves and the amount we are exchaning,
                                                        and outputs the amount we would recieve in
                                                        exchange.
                                                    </p>{" "}
                                                </div>
                                                <div className="m-12 flex justify-center">
                                                    <div className="flex justify-center">
                                                        <p className="text-left text-xl text-bold m-3 text-white min-w-max ">
                                                            {" "}
                                                            b = (y * a * 0,997) / (x + a * 0,997)
                                                        </p>
                                                    </div>
                                                    <p className="text-center  text-bold m-5 text-white">
                                                        {" "}
                                                        The final formula represented in the smart
                                                        contract takes also into consideration the
                                                        0,3% fee which is kept in the liquidity
                                                        pool, and the remaining 99,7% is transfered
                                                        to the user.
                                                    </p>{" "}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                onClick={() => setShowMath(0)}
                                                onMouseOver={() => setShowText(true)}
                                                onMouseLeave={() => setShowText(false)}
                                                class="bg-pink-500 hover:bg-pink-700 animate-bounce text-white font-bold py-2 px-4 m-7 rounded focus:outline-none focus:shadow-outline"
                                                type="button"
                                            >
                                                {showText ? (
                                                    <>Click to show math explanation</>
                                                ) : (
                                                    <>y * x = k</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        The exchange price is determined by the reserve ratio
                                        between the ETH and the YEAH token. Selling ETH for YEAH
                                        tokens increases the size of the ETH reserve, and decreases
                                        the size of the YEAH token reserve. This shifts the ratio,
                                        increasing the YEAH token price relative to ETH for the
                                        subsequent transactions.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        The higher the amount of asset exchanged, the higher the
                                        amount of assets recieved but the proportion by which it
                                        increases will progressively gets smaller.
                                    </p>
                                    <p className="text-left text-gray-500  m-5 font-bold">
                                        Example:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-5">
                                        These are the amount of YEAH tokens you would recieve from
                                        exchanging 1 ETH and 10 ETH with the current reserve ratios.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        1 ETH = {ethToTokensBoughtCalculation(1)}{" "}
                                        <bold>DEX tokens</bold>
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        10 ETH = {ethToTokensBoughtCalculation(10)}{" "}
                                        <bold>DEX tokens</bold>
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-5">
                                        On this example we can see that 10 ETH doesn't return 10
                                        times what we get for exchanging 1 ETH.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        The amount that the price is moved depends on the size of
                                        the trade relative to the size of the reserves in the pool.
                                    </p>
                                    <p className="text-left text-gray-500  m-5 font-bold">
                                        Liquidity Providers:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        A key aspect of this protocol is that anyone that owns both
                                        assets can provide liquidity to the pool. Liquidity
                                        providers earn a 0.3% of each trade, which acts as an
                                        incentive to provide liquidity.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        To keep track of the liquidity provided in the pool this
                                        contract uses LP tokens, an ERC-20 token that can be traded.
                                        These tokens are minted to the account that provides
                                        liquidity in proportion with how much liquidity the user has
                                        provided to the total liquidity. With each trade the 0.3%
                                        trading fee is added to the Liquidity pool.
                                    </p>
                                    <p className="text-left text-gray-500  m-5">
                                        {" "}
                                        An LP token owner can call withdraw on the pool to extract
                                        the portion of liquidity represented by his LP tokens,
                                        burning said tokens in the process. The portion of liquidity
                                        extracted is calculated from the total liquidity users
                                        provided and the trading fees collected, therefore it will
                                        inherently include the proportional part of the trading fees
                                        the LP token owner is entitled to.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                    <p className="text-center text-gray-500 text-xs"></p>
                </div>
            ) : (
                <div className="flex justify-center"></div>
            )}
        </div>
    )
}
