<template>
  <div>
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2d3748"
      text-color="#edf2f7"
      active-text-color="#81e6d9"
      :default-active="'2'"
    >
      <el-menu-item index="1">↔️ Transaction</el-menu-item>
      <el-menu-item index="2">📊 Liquidity Pool</el-menu-item>
      <el-menu-item index="3">💼 Personal Account</el-menu-item>
    </el-menu>

    <h2>{{ poolId === "curve" ? "Curve AMM" : "Constant Mean AMM" }}</h2>

    <!-- Flex container for chart and statistics side by side -->
    <div
      id="app"
      style="
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        margin-bottom: 40px;
      "
    >
      <!-- Bar chart on the left -->
      <div style="width: 55%; margin-right: 20px">
        <div style="width: 100%; margin-bottom: 40px">
          <bar-chart
            :data="poolData.chartData"
            :labels="poolData.timeLabels"
            :title="poolData.chartTitle"
            :key="poolData.chartData.join('-')"
          />
        </div>
      </div>

      <!-- Statistics panel on the right -->
      <div
        style="
          width: 40%;
          background-color: #f8f8f8;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          margin-right: 30px;
          margin-left: 30px;
        "
      >
        <div
          style="
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          "
        >
          <!-- Buttons -->
          <el-button
            type="primary"
            style="
              background-color: #ff4c4c;
              border-color: #ff4c4c;
              color: white;
            "
            @click="goToSwap"
            >Exchange</el-button
          >
          <el-button
            type="primary"
            style="
              background-color: #f9a602;
              border-color: #f9a602;
              color: white;
            "
            @click="goToChangeLiquidityPool"
            >Add Liquidity</el-button
          >
        </div>

        <!-- Proportion Bar -->
        <div style="margin-bottom: 50px">
          <span>Pool Ratio</span>
          <div
            style="width: 100%; background-color: #e0e0e0; border-radius: 4px"
          >
            <div
              :style="{
                height: '12px',
                width: poolData.proportion + '%',
                backgroundColor: '#ff6f61',
                borderRadius: '4px',
              }"
            ></div>
          </div>
          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              margin-top: 5px;
            "
          >
            <span>{{ poolData.tokenA }}</span>
            <span>{{ poolData.tokenB }}</span>
          </div>
        </div>

        <!-- Statistics Data -->
        <div
          style="
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          "
        >
          <div
            style="
              margin-bottom: 16px;
              font-size: 16px;
              color: #333;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-weight: 500; color: #666">Pool Reserve</span>
            <span style="font-weight: 600">
              {{ poolData.balanceA }}
              <span style="color: #666">{{ poolData.tokenA }}</span> /
              {{ poolData.balanceB }}
              <span style="color: #666">{{ poolData.tokenB }}</span>
            </span>
          </div>

          <div
            style="
              margin-bottom: 16px;
              font-size: 16px;
              color: #333;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-weight: 500; color: #666"
              >24h Trading Volume<br />(Sold AWT + Sold RCT)</span
            >
            <span style="font-weight: 600">{{ poolData.volume }}</span>
          </div>

          <div
            style="
              font-size: 16px;
              color: #333;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span style="font-weight: 500; color: #666">Popularity</span>
            <span style="font-weight: 600">{{ poolData.popularity }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pool-table-container">
      <table class="pool-data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Sold</th>
            <th>Bought</th>
            <th>Signer</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in poolData.tableData" :key="index">
            <td>{{ formatTime(item.time) }}</td>
            <td>{{ Number(item.soldAmount).toFixed(2) }} {{ item.token }}</td>
            <td>
              {{ Number(item.boughtAmount).toFixed(2) }}
              {{ item.token === "AWT" ? "RCT" : "AWT" }}
            </td>
            <td>{{ item.signerAddress }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import BarChart from "@/components/BarChart.vue";
import axios from "axios";

export default {
  name: "PoolPage",
  components: {
    BarChart,
  },
  data() {
    return {
      poolData: {
        chartData: [],
        timeLabels: "",
        chartTitle: "⏳ Loading",
        tokenA: "AWT",
        tokenB: "RCT",
        balanceA: null,
        balanceB: null,
        proportion: null,
        volume: "⏳ Loading",
        popularity: "⏳ Loading",
        tableData: [],
      },
      poolId: null,
    };
  },
  created() {
    // Get pool identifier from route params
    this.poolId = this.$route.params.poolId;

    // Fetch the pool data based on the poolId
    this.loadPoolData();
  },
  methods: {
    async loadPoolData() {
      await axios
        .get("http://localhost:3300/transaction")
        .then((result) => {
          const now = Date.now();
          const nearestHour = Math.floor(now / 3600000) * 3600000;

          const timeTable = Array.from({ length: 12 }, (_, i) => {
            const start = nearestHour - (12 - i) * 3600000;
            const end = start + 3600000; // 1 小时
            return { start, end };
          });

          const timeLabels = timeTable.map(({ start, end }) => {
            const formatTime = (timestamp) => {
              const date = new Date(timestamp);
              return `${String(date.getHours()).padStart(2, "0")}:${String(
                date.getMinutes()
              ).padStart(2, "0")}`;
            };

            return `${formatTime(start)}–`;
          });

          const poolNumber = this.poolId === "curve" ? "1" : "2";

          const tableData = result.data.filter(
            (item) => item.pool === poolNumber
          );

          const chartData = timeTable.map(({ start, end }) => {
            // 过滤出在当前时间段内的数据
            const itemsInRange = tableData.filter((item) => {
              const itemTime = new Date(item.time).getTime(); // 假设每条数据有 time 字段
              return itemTime >= start && itemTime < end;
            });

            // 计算 soldAmount 的总和
            const totalSoldAmount = itemsInRange.reduce((sum, item) => {
              return sum + (parseFloat(item.soldAmount) || 0); // 确保 soldAmount 是数字
            }, 0);

            return totalSoldAmount;
          });

          console.log(chartData);

          this.poolData.chartData = chartData;
          this.poolData.timeLabels = timeLabels;
          this.poolData.chartTitle = "Sold AWT + Sold RCT";
          this.poolData.tableData = tableData;

          // 下面再算 24 h 交易量

          const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

          // 先筛选出24小时内的所有交易
          const recentTransactions = tableData.filter(
            (tx) => tx.time >= twentyFourHoursAgo
          );

          // 初始化统计对象
          let stats = 0;

          // 遍历交易并累加
          recentTransactions.forEach((tx) => {
            stats += tx.soldAmount;
          });

          this.poolData.volume = stats.toFixed(2);
        })
        .catch((error) => {
          this.poolData.chartTitle = "❌ Failed to load";
          this.poolData.volume = "❌ Failed to load";
          console.error(error);
        });

      try {
        let contractAddress;
        await axios.get("http://localhost:3300/address").then((result) => {
          if (this.poolId === "curve") {
            contractAddress = result.data.addressCurve;
          } else {
            contractAddress = result.data.addressSum;
          }
        });
        // Connect to Hardhat local blockchain
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const contract = new ethers.Contract(
          contractAddress,
          [
            "function getReserve() public view returns (uint, uint)",
            "function getPopularity() public view returns(uint)",
          ],
          provider
        );
        const [balanceA, balanceB] = await contract.getReserve();
        [this.poolData.balanceA, this.poolData.balanceB] = [
          Number(balanceA),
          Number(balanceB),
        ];
        this.poolData.proportion =
          this.poolData.balanceA / this.poolData.balanceB;
        this.poolData.popularity = await contract.getPopularity();
      } catch (error) {
        console.error(error);
        this.poolData.popularity = "❌ Failed to load";
      }
    },
    formatTime(timestamp) {
      // 将UNIX时间戳转换为可读格式
      return new Date(timestamp).toLocaleString();
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
    goToSwap() {
      this.$router.push({ name: "TradePage", params: { poolId: this.poolId } });
    },
    goToChangeLiquidityPool() {
      this.$router.push({
        name: "AddDropLiquidity",
        params: { poolId: this.poolId },
      });
    },
  },
  watch: {
    // 当result.data变化时重新筛选数据
    "result.data": {
      handler() {
        this.filterPoolData();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.pool-table-container {
  margin: 24px 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
}

h2 {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.pool-data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.pool-data-table thead {
  background-color: #f8fafc;
}

.pool-data-table th {
  padding: 16px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left; /* 所有表头左对齐 */
  border-bottom: 1px solid #e2e8f0;
}

.pool-data-table td {
  padding: 14px 20px;
  font-size: 0.9375rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  text-align: left; /* 所有内容单元格左对齐 */
}

/* 移除之前单独设置的数字列右对齐 */
/* .pool-data-table td:nth-child(2),
.pool-data-table td:nth-child(3) {
  text-align: right;
} */

.pool-data-table tr:last-child td {
  border-bottom: none;
}

.pool-data-table tr:hover td {
  background-color: #f8fafc;
}

/* 地址列样式 */
.pool-data-table td:nth-child(4) {
  font-family: "Roboto Mono", monospace;
  font-size: 0.8125rem;
  color: #475569;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .pool-data-table th,
  .pool-data-table td {
    padding: 12px 16px;
    font-size: 0.8125rem;
  }

  .pool-table-container h2 {
    font-size: 1.25rem;
  }
}
</style>
