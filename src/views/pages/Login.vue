<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login-bg">
    <div class="login-container">
      <div class="login-header">
        <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
        <div class="login-title">易随销管理后台</div>
      </div>
      <el-form :model="param" :rules="rules" ref="loginForm" size="large">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="用户名">
            <template #prepend>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="密码"
            v-model="param.password"
            @keyup.enter="submitForm(loginForm)"
          >
            <template #prepend>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <div class="pwd-tips">
          <el-checkbox class="pwd-checkbox" v-model="checked" label="记住密码" />
          <!-- <el-link type="primary" @click="$router.push('/reset-pwd')">忘记密码</el-link> -->
        </div>
        <el-button
          class="login-btn"
          type="primary"
          size="large"
          @click="submitForm(loginForm)"
          :loading="loading"
          >登录</el-button
        >
        <p class="login-tips">Tips : zxjy/zxjy</p>
        <!-- <p class="login-text">
          没有账号？<el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
        </p> -->
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTabsStore } from '@/store/tabs'
import { usePermissStore } from '@/store/permiss'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login as loginApi } from '@/api/login'
import { resetRouter } from '@/router'

interface LoginInfo {
  username: string
  password: string
}

const lgStr = localStorage.getItem('login-param')
const defParam = lgStr ? JSON.parse(lgStr) : null
const checked = ref(lgStr ? true : false)
const loading = ref(false)

const router = useRouter()
const param = reactive<LoginInfo>({
  username: defParam ? defParam.username : '',
  password: defParam ? defParam.password : '',
})

const rules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const permiss = usePermissStore()
const loginForm = ref<FormInstance>()

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await loginApi({
          username: param.username,
          password: param.password,
        })
        if (res.code === '00000') {
          ElMessage.success('登录成功')
          // 保存用户信息和token
          localStorage.setItem('ms_username', param.username)
          localStorage.setItem('token', res.data)

          // 清除之前的路由
          resetRouter()

          // 设置权限
          const permissions = [
            '1',
            '1_1',
            '1_2',
            '1_3',
            '1_4',
            '1_5',
            '1_6',
            '1_6_1',
            '1_6_2',
            '1_6_3',
            '1_6_4',
            '1_7',
            '1_7_1',
            '1_7_2',
            '1_7_3',
            '1_8',
            '1_8_1',
            '1_8_2',
            '1_8_3',
            '2',
            '2_1',
            '2_2',
          ]
          permiss.handleSet(permissions)

          // 将权限信息保存到localStorage
          localStorage.setItem('permissions', JSON.stringify(permissions))

          // 重置路由添加状态
          permiss.setAddRoutes(false)

          // 跳转到首页
          router.push('/')

          if (checked.value) {
            localStorage.setItem('login-param', JSON.stringify(param))
          } else {
            localStorage.removeItem('login-param')
          }
        } else {
          ElMessage.error(res.msg)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        // 网络错误已经在请求拦截器中处理过了，这里不需要再处理
      } finally {
        loading.value = false
      }
    }
  })
}

const tabs = useTabsStore()
tabs.clearTabs()
</script>

<style scoped>
.login-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: url(../../assets/img/login-bg.jpg) center/cover no-repeat;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.logo {
  width: 35px;
}

.login-title {
  font-size: 22px;
  color: #333;
  font-weight: bold;
}

.login-container {
  width: 450px;
  border-radius: 5px;
  background: #fff;
  padding: 40px 50px 50px;
  box-sizing: border-box;
}

.pwd-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: -10px 0 10px;
  color: #787878;
}

.pwd-checkbox {
  height: auto;
}

.login-btn {
  display: block;
  width: 100%;
}

.login-tips {
  font-size: 12px;
  color: #999;
}

.login-text {
  display: flex;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #787878;
}
</style>
