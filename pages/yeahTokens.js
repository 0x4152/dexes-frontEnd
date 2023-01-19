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
    const tokenControlAddress = 0x0428be3c63277a1244fc1e610e9f2d9d5cf089fd
    //stateVariables
    const [owners, setOwners] = useState(0)
    const [txCount, setTxCount] = useState(0)
    const [lastTxIndex, setLastTxIndex] = useState(0)

    //calculations

    //useEffect
    async function updateUI() {
        let _owners = await getOwners()

        setOwners(_owners)
        let _txCount = await getTransactionCount()

        setTxCount(_txCount)
        let _lastTxIndex = await getLastTxIndex()
        setLastTxIndex(_lastTxIndex)
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
            newOwner: account,
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
        <div className="container mx-1">
            {" "}
            {isWeb3Enabled ? (
                chainString == 5 ? (
                    <div>all good </div>
                ) : (
                    <div> not in goerli</div>
                )
            ) : (
                <div> web3 not enabled</div>
            )}
        </div>
    )
}
