<template>
  <div>
    <!-- 导航栏 -->
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2d3748"
      text-color="#edf2f7"
      active-text-color="#81e6d9"
    >
      <el-menu-item index="1">↔️ Transaction</el-menu-item>
      <el-menu-item index="2">📊 Liquidity Pool</el-menu-item>
      <el-menu-item index="3">💼 Personal Account</el-menu-item>
    </el-menu>

    <!-- 流动性管理表单 -->
    <div
      style="
        display: flex;
        justify-content: center;
        margin-top: 40px;
        padding: 20px;
      "
    >
      <div
        style="
          width: 400px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        "
      >
        <h2 style="text-align: center; font-weight: bold">Manage Liquidity</h2>

        <!-- 选择代币对 -->
        <div style="margin-bottom: 20px">
          <label for="pair" style="font-size: 16px; font-weight: 500"
            >Select liquidity pool</label
          >
          <el-select
            v-model="selectedPair"
            placeholder="Select a liquidity pool"
            style="width: 100%; margin-top: 10px"
            disabled
          >
            <el-option label="Curve AMM" value="CurveAMM"></el-option>
            <el-option
              label="Constant Mean AMM"
              value="ConstantMeanAMM"
            ></el-option>
          </el-select>
        </div>

        <!-- 选择代币 -->
        <div style="margin-bottom: 20px">
          <label for="pair" style="font-size: 16px; font-weight: 500"
            >Select Token</label
          >
          <el-select
            v-model="selectedToken"
            placeholder="Select Token"
            style="width: 100%; margin-top: 10px"
          >
            <el-option label="AWT" value="AWT"></el-option>
            <el-option label="RCT" value="RCT"></el-option>
          </el-select>
        </div>

        <!-- 输入金额 -->
        <div style="margin-bottom: 20px">
          <label for="amount" style="font-size: 16px; font-weight: 500"
            >Input amount</label
          >
          <el-input
            id="amount"
            v-model="amount"
            style="width: 100%; margin-top: 10px"
            placeholder="Input amount"
            type="number"
            min="0"
          />
        </div>

        <!-- 操作按钮 -->
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          "
        >
          <el-button type="success" style="width: 48%" @click="addLiquidity">
            Add Liquidity
          </el-button>
          <el-button type="danger" style="width: 48%" @click="removeLiquidity">
            Remove Liquidity
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import axios from "axios";

export default {
  name: "LiquidityPage",
  data() {
    return {
      selectedPair: "", // 用户选择的代币对
      selectedToken: "", // 用户选择代币
      amount: "", // 用户输入的金额
      // contractAddress: {
      //   CurveAMM: "0xContractAddress1",
      //   ConstantMeanAMM: "0xContractAddress2",
      // },
    };
  },
  created() {
    // Get pool identifier from route params
    const poolId = this.$route.params.poolId;

    // Fetch the pool data based on the poolId
    this.initialize(poolId);
  },
  methods: {
    // 导航栏选择
    initialize(poolId) {
      switch (poolId) {
        case "curve":
          this.selectedPair = "CurveAMM";
          break;
        case "constantMean":
          this.selectedPair = "ConstantMeanAMM";
          break;
      }
    },
    handleSelect(index) {
      if (index == "1") {
        this.$router.push({ name: "TradePage" });
      } else if (index == "2") {
        this.$router.push({ name: "LiquidityPool" });
      } else if (index == "3") {
        this.$router.push({ name: "PersonalAccount" });
      }
    },

    // 添加流动性
    async addLiquidity() {
      if (!this.selectedPair || !this.amount) {
        this.$message.error(
          "Please select a liquidity pool and input the amount!"
        );
        return;
      }

      try {
        // 检查 Metamask 是否安装
        if (!window.ethereum) {
          this.$message.error("Please install and activate Metamask!");
          return;
        }

        // 请求 Metamask 连接
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 获取用户地址
        const userAddress = await signer.getAddress();
        console.log("User Address:", userAddress);

        let contractAddress1;
        let contractAddress2;
        await axios.get("http://localhost:3300/address").then((result) => {
          contractAddress1 = result.data.contractAddress1;
          contractAddress2 = result.data.contractAddress2;
        });
        let contractAddress;
        if (this.selectedPair == "CurveAMM") {
          contractAddress = contractAddress1;
        } else {
          contractAddress = contractAddress2;
        }
        let flag;
        if (this.selectedToken == "AWT") {
          flag = 0;
        } else {
          flag = 1;
        }
        console.log("token:", flag);
        console.log("contract address:", contractAddress);
        // 调用智能合约的 addLiquidity 方法
        // const contractAddress = this.contractAddresses[this.selectedPair]; // 替换为你的合约地址
        const abi = [
          // 替换为你的合约 ABI
          "function addLiquidity(uint flag, uint amount) external",
        ];
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // 调用合约方法
        // const amountInWei = ethers.parseEther(String(this.amount)); // 转换为 Wei
        const tx = await contract.addLiquidity(flag, this.amount * 100);
        // await tx.wait();

        this.$message.success("Successfully added liquidity!");
      } catch (error) {
        console.error(error);
        this.$message.error("Liquidity adding failed!");
      }
    },

    // 移除流动性
    async removeLiquidity() {
      if (!this.selectedPair || !this.amount) {
        this.$message.error(
          "Please select a liquidity pool and input the amount!"
        );
        return;
      }

      try {
        // 检查 Metamask 是否安装
        if (!window.ethereum) {
          this.$message.error("Please install and activate Metamask!");
          return;
        }

        // 请求 Metamask 连接
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // 获取用户地址
        const userAddress = await signer.getAddress();
        console.log("User Address:", userAddress);

        // 调用智能合约的 removeLiquidity 方法
        const contractAddress = this.contractAddresses[this.selectedPair]; // 替换为你的合约地址
        const abi = [
          // 替换为你的合约 ABI
          "function removeLiquidity(string pair, uint256 amount) public",
        ];
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // 调用合约方法
        const amountInWei = ethers.utils.parseEther(this.amount.toString()); // 转换为 Wei
        const tx = await contract.removeLiquidity(
          this.selectedPair,
          amountInWei
        );
        await tx.wait();

        this.$message.success("Successfully removed liquidity!");
      } catch (error) {
        console.error(error);
        this.$message.error("Liquidity removal failed!");
      }
    },
  },
};
</script>

<style scoped>
.el-input {
  border-radius: 6px;
  font-size: 16px;
}
.el-menu-demo {
  transition: all 0.3s ease; /* 平滑过渡效果 */
  border-bottom: 1px solid rgba(79, 209, 197, 0.3); /* 与激活色呼应的底边 */
}

.el-menu-item {
  transition: text-shadow 0.2s;
}

.el-menu-item.is-active {
  text-shadow: 0 0 12px currentColor; /* 当前颜色的柔和光晕 */
  border-bottom: 2px solid currentColor !important; /* 底部高光线 */
}
</style>
