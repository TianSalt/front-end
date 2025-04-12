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
  </div>
  <div class="home-page">
    <div class="chart-container">
      <PieChart
        :data="chartData1"
        :labels="chartLabels1"
        :title="title1"
        :key="chartData1.join('-')"
      />
      <PieChartTwo
        :data="chartData2"
        :labels="chartLabels2"
        :title="title2"
        :key="chartData1.join('-')"
      />
    </div>
    <div class="native-table-container">
      <table class="native-table">
        <thead>
          <tr>
            <th>Pool</th>
            <th>Total Reserve</th>
            <th>24h Volume</th>
            <th>Popularity</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in tableData"
            :key="index"
            @click="handleRowClick(row)"
            class="clickable-row"
          >
            <td>{{ row.pool }}</td>
            <td>{{ row.total }}</td>
            <td>{{ row.volume[0] }}<br />{{ row.volume[1] }}</td>
            <td>{{ row.popularity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ethers } from "ethers";
import PieChart from "../components/PieChart.vue";
import PieChartTwo from "@/components/PieChartTwo.vue";

export default {
  name: "HomePage",
  components: {
    PieChart,
    PieChartTwo,
  },
  data() {
    return {
      // chartData1: [80,60],//数据1
      // chartData2: [80, 60], //数据2
      chartData1: [],
      chartData2: [],
      chartLabels1: ["AWT", "RCT"],
      chartLabels2: ["AWT", "RCT"],
      title1: "Curve AMM",
      title2: "Constant Mean AMM",
      tableData: [
        {
          pool: "Curve AMM",
          total: "⏳ Loading",
          volume: ["⏳ Loading", "⏳ Loading"],
          popularity: "⏳ Loading",
        },
        {
          pool: "Constant Mean AMM",
          total: "⏳ Loading",
          volume: ["⏳ Loading", "⏳ Loading"],
          popularity: "⏳ Loading",
        },
      ],
    };
  },
  mounted() {
    // Fetch data from the contract when the component is mounted
    this.fetchDataFromContract();
  },
  methods: {
    async fetchDataFromContract() {
      // Call the contract methods to fetch data

      // Replace with your contract's address and ABI
      await axios
        .get("http://localhost:3300/transaction")
        .then((result) => {
          // 获取当前时间（UNIX时间戳，秒）
          const now = Math.floor(Date.now() / 1000);
          const twentyFourHoursAgo = now - 24 * 60 * 60;

          // 先筛选出24小时内的所有交易
          const recentTransactions = result.data.filter(
            (tx) => tx.time >= twentyFourHoursAgo
          );

          // 初始化统计对象
          const stats = {
            pool1: {
              AWT: { soldAmount: 0, boughtAmount: 0 },
              RCT: { soldAmount: 0, boughtAmount: 0 },
            },
            pool2: {
              AWT: { soldAmount: 0, boughtAmount: 0 },
              RCT: { soldAmount: 0, boughtAmount: 0 },
            },
          };

          // 遍历交易并累加
          recentTransactions.forEach((tx) => {
            if (tx.pool === "1") {
              if (tx.token === "AWT") {
                stats.pool1.AWT.soldAmount += tx.soldAmount;
                stats.pool1.AWT.boughtAmount += tx.boughtAmount;
              } else if (tx.token === "RCT") {
                stats.pool1.RCT.soldAmount += tx.soldAmount;
                stats.pool1.RCT.boughtAmount += tx.boughtAmount;
              }
            } else if (tx.pool === "2") {
              if (tx.token === "AWT") {
                stats.pool2.AWT.soldAmount += tx.soldAmount;
                stats.pool2.AWT.boughtAmount += tx.boughtAmount;
              } else if (tx.token === "RCT") {
                stats.pool2.RCT.soldAmount += tx.soldAmount;
                stats.pool2.RCT.boughtAmount += tx.boughtAmount;
              }
            }
          });
          this.tableData[0].volume[0] =
            "-" +
            stats.pool1.AWT.soldAmount.toFixed(2) +
            " AWT　+" +
            stats.pool1.RCT.boughtAmount.toFixed(2) +
            " AWT";
          this.tableData[0].volume[1] =
            "-" +
            stats.pool1.RCT.soldAmount.toFixed(2) +
            " RCT　+" +
            stats.pool1.AWT.boughtAmount.toFixed(2) +
            " RCT";
          this.tableData[1].volume[0] =
            "-" +
            stats.pool2.AWT.soldAmount.toFixed(2) +
            " AWT　+" +
            stats.pool2.RCT.boughtAmount.toFixed(2) +
            " AWT";
          this.tableData[1].volume[1] =
            "-" +
            stats.pool2.RCT.soldAmount.toFixed(2) +
            " RCT　+" +
            stats.pool2.AWT.boughtAmount.toFixed(2) +
            " RCT";
        })
        .catch(() => {
          this.tableData[0].volume[0] = "❌ Failed to load";
          this.tableData[0].volume[1] = "❌ Failed to load";
          this.tableData[1].volume[0] = "❌ Failed to load";
          this.tableData[1].volume[1] = "❌ Failed to load";
        });

      // 获取存量与受欢迎程度
      try {
        let contractAddress1;
        let contractAddress2;
        await axios.get("http://localhost:3300/address").then((result) => {
          contractAddress1 = result.data.addressCurve;
          contractAddress2 = result.data.addressSum;
        });
        // Connect to Hardhat local blockchain
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const contract1 = new ethers.Contract(
          contractAddress1,
          [
            "function getReserve() public view returns (uint, uint)",
            "function getPopularity() public view returns(uint)",
          ],
          provider
        );
        const contract2 = new ethers.Contract(
          contractAddress2,
          [
            "function getReserve() public view returns (uint, uint)",
            "function getPopularity() public view returns(uint)",
          ],
          provider
        );
        const [data1Value1, data1Value2] = await contract1.getReserve();
        const [data2Value1, data2Value2] = await contract2.getReserve();
        const popularity1 = await contract1.getPopularity();
        const popularity2 = await contract2.getPopularity();
        // Update the chart data in the component state
        this.chartData1 = [Number(data1Value1), Number(data1Value2)];
        this.chartData2 = [Number(data2Value1), Number(data2Value2)];

        // pool, total, volume, popularity
        this.tableData = [
          {
            pool: "Curve AMM",
            total: Number(data1Value1) + Number(data1Value2),
            volume: volume1,
            popularity: popularity1,
          },
          {
            pool: "Constant Mean AMM",
            total: Number(data2Value1) + Number(data2Value2),
            volume: volume2,
            popularity: popularity2,
          },
        ];
      } catch (error) {
        console.error(error);
        this.tableData[0].total = "❌ Failed to load";
        this.tableData[1].total = "❌ Failed to load";
        this.tableData[0].popularity = "❌ Failed to load";
        this.tableData[1].popularity = "❌ Failed to load";
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
    handleRowClick(row) {
      if (row.pool === "Curve AMM") {
        this.$router.push({
          name: "PoolPage",
          params: { poolId: "curve" },
        });
      } else if (row.pool == "Constant Mean AMM") {
        this.$router.push({
          name: "PoolPage",
          params: { poolId: "constantMean" },
        });
      }
    },
  },
};
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

button {
  margin-top: 20px;
}

/* 基础表格容器 */
.native-table-container {
  width: 750px;
  margin: 25px auto; /* 增大上方 margin（原为 20px） */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 表格主体 */
.native-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Segoe UI", Roboto, sans-serif;
  color: #333;
  text-align: center; /* 全局居中（表头和内容） */
}

/* 表头样式 */
.native-table th {
  background-color: #f8fafc;
  padding: 14px 16px;
  font-weight: 600;
  color: #606266;
  border-bottom: 2px solid #e6e8eb;
  position: sticky;
  top: 0;
}

/* 表格单元格 */
.native-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}

/* 行悬停效果 */
.native-table tr:hover td {
  background-color: #f5f7fa;
}

.clickable-row {
  cursor: pointer;
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
