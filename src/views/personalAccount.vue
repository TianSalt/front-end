<template>
  <div>
    <!-- Navigation Bar -->
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2d3748"
      text-color="#edf2f7"
      active-text-color="#81e6d9"
      :default-active="'3'"
    >
      <el-menu-item index="1">↔️ Transaction</el-menu-item>
      <el-menu-item index="2">📊 Liquidity Pool</el-menu-item>
      <el-menu-item index="3">💼 Personal Account</el-menu-item>
    </el-menu>

    <!-- Personal Account Section -->
    <div class="account-container">
      <h2>Personal Account</h2>
      <p>Here is your share in each liquidity pool:</p>
      <div v-if="loading" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="pool-data">
        <div v-for="(pool, index) in poolShares" :key="index" class="pool-item">
          <h3>{{ pool.name }}</h3>
          <p>Your Share: ({{ pool.percentage }}%)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      error: null,
      poolShares: [], // Stores user share data for each liquidity pool
      contractAddress1: "",
    };
  },
  methods: {
    handleSelect(index) {
      if (index == "1") {
        this.$router.push({ name: "TradePage" });
      } else if (index == "2") {
        this.$router.push({ name: "LiquidityPool" });
      } else if (index == "3") {
        this.$router.push({ name: "PersonalAccount" });
      }
    },
    async fetchContractAddresses() {
      try {
        // Fetch contract addresses from backend (JSON file)
        const response = await axios.get("http://localhost:3300/address");
        return response.data; // Assume response contains { contract1Address, contract2Address }
      } catch (err) {
        throw new Error("Failed to fetch contract addresses.");
      }
    },
    async fetchPoolShares() {
      try {
        if (!window.ethereum) {
          this.$message.error("请先安装 Metamask！");
          return;
        }
        this.loading = true;

        // Connect to MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const userAddress = await signer.getAddress();

        let contractAddress1;
        let contractAddress2;

        // Fetch contract addresses from backend (JSON file)
        await axios.get("http://localhost:3300/address").then((result) => {
          contractAddress1 = result.data.contractAddress1;
          contractAddress2 = result.data.contractAddress2;
        });

        console.log(contractAddress1);
        const contractABI = [
          "function getShare() public view returns(uint, uint)",
        ];

        // Load contracts
        const contract1 = new ethers.Contract(
          contractAddress1,
          contractABI,
          signer
        );
        const contract2 = new ethers.Contract(
          contractAddress2,
          contractABI,
          signer
        );

        // Fetch user shares from contracts
        const [share1, total1] = await contract1.getShare();
        const [share2, total2] = await contract2.getShare();

        // Calculate percentages
        const pool1Percentage =
          Number(total1) > 0
            ? ((Number(share1) / Number(total1)) * 100).toFixed(2)
            : 0;
        const pool2Percentage =
          Number(total2) > 0
            ? ((Number(share2) / Number(total2)) * 100).toFixed(2)
            : 0;

        // Update state
        this.poolShares = [
          { name: "Curve AMM", percentage: pool1Percentage }, // share: String(share1), total: String(total1),
          { name: "Constant Mean AMM", percentage: pool2Percentage }, //share: String(share2), total: String(total2),
        ];
      } catch (err) {
        this.error = "Failed to load pool data. Please try again.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchPoolShares();
  },
};
</script>

<style>
.account-container {
  padding: 20px;
}
.loading {
  color: blue;
}
.error {
  color: red;
}
.pool-data {
  margin-top: 20px;
}
.pool-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
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
