import { systemMenuApi } from '@service/auth';
import { Local } from '@service/storage';
import { action, makeObservable, observable } from 'mobx';
import { createContext, useContext } from 'react';

/**
 * 全局状态管理
 */
class CommonStore {
  constructor() {
    makeObservable(this);
  }

  /** 系统菜单列表 */
  @observable
  menuList = [];

  /** 获取系统菜单列表 */
  @action.bound
  async getSystemMenuList() {
    // 未获取token不触发请求
    const token = Local.get('_token');
    if (!token) return;
    const { data, result } = await systemMenuApi();
    if (result) {
      const list = data && data.length > 0 ? data : [];
      this.menuList = list;
    }
  }

  /** 系统菜单更新 */
  @action.bound
  updateMenuList() {
    if (this.menuList.length === 0) {
      this.getSystemMenuList();
    }
  }
  
  /** 系统菜单清空 */
  @action.bound
  clearMenuList() {
    this.menuList = [];
  }
}

const store = new CommonStore();

const storeContext = createContext(store);
const useStore = () => useContext(storeContext);

export default useStore;
