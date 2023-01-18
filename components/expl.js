import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
import { Alert } from "@mui/material"
import { Scatter } from "react-chartjs-2"
import { Chart as ChartJS } from "chart.js/auto"

import { useWeb3Contract, useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { parse } from "graphql"
export default function Explanation({
    tokenAmount,
    dexDisplayed,
    ethReserves,
    tokenReserves,
    expectedEthAmount,
    expectedTokenAmount,
    setTokenAmount,
    setDexDisplayed,
}) {
    const [showExp, setShowExp] = useState(0)
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
            <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <div className="flex items-center justify-between m-2"></div>{" "}
                        {showExp ? (
                            <div>
                                <button
                                    onClick={() => setShowExp(0)}
                                    class="m-2 inline-block border border-blue-400 rounded bg-white  hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                                    href="#"
                                >
                                    Hide
                                </button>
                                <div className="text-xl">
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        A liquidity pool is a smart contract that holds two assets
                                        to facilitate exchanges between these assets in a
                                        decentralized manner. This liquidity pool is based on the
                                        Uniswap V1 protocol, which facilitates exchanges between ETH
                                        and any ERC20 token.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        Its a way of bypassing a traditional order-book exchange
                                        system, where buyers are matched with sellers to facilitate
                                        exhanges. This kind of system isn't optimal for a
                                        decentralized platform, therefore we use a system that
                                        leverages math and market participants to give a fair market
                                        value to anyone that desires to trade a pair of assets,
                                        without relying on external parties.
                                    </p>
                                    <p className="text-left text-gray-500  m-3 font-bold">
                                        Constant Product:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        The code of the liquidity pool smart contract leverages a
                                        "constant product" market making formula. Traders can swap
                                        between the two assets in either direction by adding to the
                                        liquidity reserve of one and withdrawing from the reserve of
                                        the other.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        The exchange price is determined by the reserve ratio
                                        between the ETH and the YEAH token. Selling ETH for YEAH
                                        tokens increases the size of the ETH reserve, and decreases
                                        the size of the YEAH token reserve. This shifts the ratio,
                                        increasing the YEAH token price relative to ETH for the
                                        subsequent transactions.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        In simple terms: the higher the amount of asset exchanged,
                                        the amount of assets recieved will increase but the
                                        proportion by which it increases will progressively gets
                                        smaller.
                                    </p>
                                    <p className="text-left text-gray-500  m-3 font-bold">
                                        Example:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-3">
                                        These are the amount of YEAH tokens you would recieve from
                                        exchanging 1 ETH and 10 ETH with the current reserve ratios.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        1 ETH = {ethToTokensBoughtCalculation(1)}{" "}
                                        <bold>YEAH tokens</bold>
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        10 ETH = {ethToTokensBoughtCalculation(10)}{" "}
                                        <bold>YEAH tokens</bold>
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-3">
                                        On this example we can see that 10 ETH doesn't return 10
                                        times what we get for exchanging 1 ETH.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        The amount that the price is moved depends on the size of
                                        the trade relative to the size of the reserves in the pool.
                                    </p>
                                    <p className="text-left text-gray-500  m-3 font-bold">
                                        Liquidity Providers:
                                    </p>{" "}
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        A key aspect of this protocol is that anyone that owns both
                                        assets can provide liquidity to the pool. Liquidity
                                        providers earn a 0.3% of each trade, which acts as an
                                        incentive to provide liquidity.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        To keep track of the liquidity provided in the pool this
                                        contract uses LP tokens, an ERC-20 token that can be traded.
                                        These tokens are minted to the account that provides
                                        liquidity in proportion with how much liquidity the user has
                                        provided to the total liquidity. With each trade the 0.3%
                                        trading fee is added to the Liquidity pool.
                                    </p>
                                    <p className="text-left text-gray-500  m-3">
                                        {" "}
                                        An LP token owner can call withdraw on the pool to extract
                                        the portion of liquidity represented by his LP tokens,
                                        burning said tokens in the process. The portion of liquidity
                                        extracted is calculated from the total liquidity users
                                        provided and the trading fees collected,therefore it will
                                        inherently include the proportional part of the trading fees
                                        the LP token owner is entitled to.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowExp(1)}
                                    class="inline-block border hover:bg-blue-800 border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    href="#"
                                >
                                    What's a Liquidity Pool and how does it work?
                                </button>
                            </div>
                        )}
                        {showExp ? (
                            <div>
                                <button
                                    onClick={() => setShowExp(0)}
                                    class="m-2 inline-block border border-blue-400 rounded bg-white  hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3"
                                    href="#"
                                >
                                    Hide
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowExp(1)}
                                    class="inline-block border hover:bg-blue-800 border-blue-500 rounded py-1 px-3 bg-blue-500 text-white"
                                    href="#"
                                >
                                    How it the amount recieved calculated?
                                </button>
                            </div>
                        )}
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
