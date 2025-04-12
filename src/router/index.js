import { createRouter, createWebHistory } from 'vue-router';
import LiquidityPool from '@/views/LiquidityPool.vue';
import TradePage from '@/views/TradePage.vue';
import HomePage from '@/views/HomePage.vue';
import AddDropLiquidity from '@/views/AddDropLiquidity.vue';
import PoolPage from '@/components/PoolPage.vue';
import PersonalAccount from '@/views/personalAccount.vue';
const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/LiquidityPool',
    name: 'LiquidityPool',
    component: LiquidityPool
  },
  {
    path: '/TradePage/:poolId?',
    name: 'TradePage',
    component: TradePage
  },
  {
    path: '/AddDropLiquidity/:poolId',
    name: 'AddDropLiquidity',
    component: AddDropLiquidity
  },
  {
    path: '/PoolPage/:poolId',
    name: 'PoolPage',
    component: PoolPage
  },
  {
    path: '/PersonalAccount',
    name: 'PersonalAccount',
    component: PersonalAccount
  }
];

const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_BASE_URL || '/'),
  routes
});

export default router;
