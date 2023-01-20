import Head from "next/head"
import Image from "next/image"
import checkImage from "../img/shield.png"
import thumbImage from "../img/thumb.png"
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"
import DexABI from "../constants/DexV1abi.json"
import YEAHABI from "../constants/YEAHabi.json"
import WBTCabi from "../constants/WBTC.json"
import LPTokenabi from "../constants/LPTokenabi.json"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import DexV1EthToToken from "../components/dexV1EthToToken"
import DexV1TokenToEth from "../components/dexV1TokenToEth"
import Graph from "../components/graph"
import WETHabi from "../constants/WETHabi.json"
import Reserves from "../components/reserves"
import Explanation from "../components/expl"
import { letterSpacing } from "@mui/system"
import tokenControlAbi from "../constants/tokenControlAbi.json"

export default function Home() {
    const dispatch = useNotification()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "1337"

    const DexAddress = networkMapping[chainString]["DexV1"][0]
    const YeahTokenAddress = networkMapping[chainString]["YeahToken"][0]
    const LPTokenAddress = networkMapping[chainString]["LPToken"][0]
    const tokenControlAddress = networkMapping[chainString]["TokenControl"][0]
    //stateVariables
    const [owners, setOwners] = useState(0)
    const [txCount, setTxCount] = useState(0)
    const [lastTxIndex, setLastTxIndex] = useState(0)
    const [inputIndex, setInputIndex] = useState(0)
    const [txInfo, setTxInfo] = useState({ txIndex: 0, numConfirmations: 0, executed: false })

    const [isOwner, setIsOwner] = useState(false)
    //calculations

    //useEffect
    async function updateUI() {
        let _owners = await getOwners()
        for (let i = 0; i < _owners.length; i++) {
            if (account.toString == _owners[0].toString) {
                setIsOwner(true)
            }
        }
        setOwners(_owners)
        let _txCount = await getTransactionCount()

        setTxCount(_txCount)
        let _lastTxIndex = await getLastTxIndex()
        setLastTxIndex(_lastTxIndex)
        let transactionInfo = await getTransaction()
        setTxInfo({
            txIndex: inputIndex ? inputIndex : Number(lastTxIndex),
            numConfirmations: Number(transactionInfo[4]),
            executed: transactionInfo[3],
        })
    }

    useEffect(() => {}, [])

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    ///////////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    //Handle card clicks

    const handleMintErc20Click = () => {
        mint1YEAH()
    }
    const mint1YEAH = () => {
        erc20Mint({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleMint1YeahSuccess(tx),
        })
    }
    const handleMint1YeahSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction submitted to multisig",
            position: "topR",
        })
    }
    //////////////////////////////////////////
    const handleConfirmClick = () => {
        confirmTx()
    }
    const confirmTx = () => {
        confirmTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleConfirmSuccess(tx),
        })
    }
    const handleConfirmSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction confirmed",
            position: "topR",
        })
    }

    ///////////////////
    const handleExecuteClick = () => {
        executeTx()
    }
    const executeTx = () => {
        executeTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleExecuteSuccess(tx),
        })
    }
    const handleExecuteSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction executed",
            position: "topR",
        })
    }
    ///////////////////
    const handleRevokeClick = () => {
        revokeTx()
    }
    const revokeTx = () => {
        revokeTransaction({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleRevokeSuccess(tx),
        })
    }
    const handleRevokeSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Confirmation Revoked",
            position: "topR",
        })
    }
    ///////////////////
    const handleAddOwnerClick = () => {
        addOwners()
    }
    const addOwners = () => {
        addOwner({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: (tx) => handleAddOwnerSuccess(tx),
        })
    }
    const handleAddOwnerSuccess = () => {
        dispatch({
            type: "success",
            message: "Transaction sent - wait for transaction confirmation and refresh the page",
            title: "Transaction sent",
            position: "topR",
        })
    }
    //contract functions
    const { runContractFunction: getTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getTransaction",
        params: {
            _txIndex: inputIndex ? inputIndex : lastTxIndex,
        },
    })
    const { runContractFunction: getLastTxIndex } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getLastTxIndex",
        params: {},
    })
    const { runContractFunction: getOwners } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getOwners",
        params: {},
    })

    const { runContractFunction: getTransactionCount } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "getTransactionCount",
        params: {},
    })
    const { runContractFunction: addOwner } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "addOwner",
        params: {
            newOwner: account ? account : "0x8B5b52af3b1326236f9C09954f0a3A106d0aB92D",
        },
    })
    const { runContractFunction: confirmTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "confirmTransaction",
        params: {
            _txIndex: 0,
        },
    })
    const { runContractFunction: executeTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "executeTransaction",
        params: {
            _txIndex: 0,
        },
    })
    const { runContractFunction: revokeTransaction } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "executeTransaction",
        params: {
            _txIndex: 0,
        },
    })
    const { runContractFunction: erc20Mint } = useWeb3Contract({
        abi: tokenControlAbi,
        contractAddress: tokenControlAddress,
        functionName: "executeTransaction",
        params: {
            erc20ContractAddress: YeahTokenAddress,
            tokenAmountToMint: "100000000000000000",
        },
    })
    return (
        <div className="container mx-1 min-h-screen">
            {" "}
            {isWeb3Enabled ? (
                chainString == 5 ? (
                    <div>
                        <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div>
                                    {" "}
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        for="username"
                                    >
                                        Yeah Token Multi-Sig
                                    </label>
                                    <p>
                                        This Dapp interacts with a smart contract that controls the
                                        minting of YEAH tokens.{" "}
                                    </p>
                                    <p>
                                        To be able to interact with this multi-sig you will have to
                                        become an owner. Click on the "become owner" button to be
                                        able to interact with the multi-sig{" "}
                                    </p>
                                    <p>
                                        Once you are an owner you will be able to queue
                                        transactions, confirm and revoke your confirmation, and
                                        lastly execute those transactions.
                                    </p>
                                    <p>
                                        To execute a transaction the transaction needs 2
                                        confirmations from the owners. You can check the number of
                                        transactions on the transaction info.
                                    </p>
                                    <p></p>
                                </div>
                            </form>
                            <p className="text-center text-gray-500 text-xs"></p>
                        </div>{" "}
                        <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div>
                                    {" "}
                                    <label
                                        className="block text-gray-700 text-sm font-bold mb-2"
                                        for="username"
                                    >
                                        Step by Step
                                    </label>
                                    <p>
                                        1. Click add my account to owners. Wait for the transaction
                                        to be included in a block.
                                    </p>
                                    <p>
                                        2. Click mint 1 YEAH. This will queue a transaction, it will
                                        then be possible to confirm the transaction.
                                    </p>
                                    <p>
                                        3. Click "Confirm the transaction" inputing the transaction
                                        index you just created.
                                    </p>
                                    <p>
                                        4. The transaction will need two confirmations to be
                                        executable. For testing purposes repeat step 1 and step 3,
                                        inputing the same tx
                                    </p>{" "}
                                    <p>
                                        5. Once the transaction has two confirmations, it can be
                                        executed, minting 1 Yeah token to the account that called
                                        the mint function.
                                    </p>
                                    <p></p>
                                </div>
                            </form>
                            <p className="text-center text-gray-500 text-xs"></p>
                        </div>{" "}
                        <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div>
                                    {isOwner ? (
                                        <button
                                            onClick={() => console.log("already an owner")}
                                            class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            type="button"
                                        >
                                            You are already an Owner!
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAddOwnerClick}
                                            class="bg-violet-400 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            type="button"
                                        >
                                            Become a Multi-Sig owner
                                        </button>
                                    )}
                                </div>
                            </form>
                            <p className="text-center text-gray-500 text-xs"></p>
                        </div>
                        <div className="w-full max-w-xl min-h-4xl hover:bg-slate-300">
                            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                                <div>
                                    <p className="text-center text-gray-500 text-xs">
                                        Transaction {txInfo.txIndex}
                                    </p>
                                    <p className="text-center text-gray-500 text-xs">
                                        Confirmations on this transaction: {txInfo.numConfirmations}
                                    </p>
                                    <p className="text-center text-gray-500 text-xs">
                                        {txInfo.executed ? (
                                            <div>
                                                Transaction {txInfo.txIndex} has been executed
                                            </div>
                                        ) : (
                                            <div>
                                                Transaction {txInfo.txIndex} has not been executed
                                            </div>
                                        )}
                                    </p>
                                </div>
                            </form>
                            <p className="text-center text-gray-500 text-xs"></p>
                        </div>
                    </div>
                ) : (
                    <div> not in goerli</div>
                )
            ) : (
                <div> web3 not enabled</div>
            )}
        </div>
    )
}
