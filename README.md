# MockExamApp

这是一个基于 **UniApp** 框架和 **Supabase** 后端服务的模拟考试应用。本项目已从纯本地静态版本升级为支持多用户、多组织和动态题库的在线考试系统。

## 技术栈 (Tech Stack)

*   **核心框架**: [UniApp](https://uniapp.dcloud.io/) (基于 Vue.js 2.x)
*   **后端服务**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
*   **开发语言**: JavaScript (ES6+)
*   **样式语言**: CSS / SCSS
*   **路由管理**: UniApp 内置路由

## 功能模块 (Functionality)

### 1. 用户系统 (User System)
*   **注册/登录**: 完整的用户认证流程，支持账号密码注册登录。
*   **用户档案**: 管理个人基本信息。

### 2. 组织架构 (Organization)
*   **多组织支持**: 用户可以加入多个组织（如不同的学校、班级或培训机构）。
*   **组织切换**: 在首页可随时切换当前上下文组织，加载对应的题库资源。
*   **加入组织**: 浏览并申请加入开放的组织。

### 3. 首页 (Home)
*   **动态题库**: 根据所选组织实时加载可用的题库列表。
*   **智能配置**:
    *   **题型过滤**: 支持按单选、多选、判断题筛选。
    *   **题量控制**: 实时获取题库库存，通过滑块动态调整考试题目数量。
*   **管理入口**: 管理员用户可访问后台管理功能。

### 4. 考试页 (Exam)
*   **在线答题**: 实时从云端获取试题。
*   **交互体验**: 优化的答题界面，支持单选、多选和判断题交互。
*   **即时判分**: 提交答案后立即反馈正误与解析。
*   **结果分析**: 考试结束后展示详细的正确率和答题情况。

## 项目结构 (Project Structure)

*   `pages/`
    *   `index/`: 首页，包含组织切换、题库选择和考试配置。
    *   `exam/`: 考试核心页面。
    *   `login/`: 用户登录页。
    *   `register/`: 用户注册页。
    *   `admin/`: 管理员后台页面。
*   `utils/`
    *   `supabase.js`: Supabase 客户端初始化及配置。
    *   `questionBank.js.bak`: (已废弃) 旧版本地静态题库备份。
*   `main.js`: Vue 初始化入口。
*   `pages.json`: 路由及页面配置。
*   `template.env`: 环境变量模板文件。

## 快速开始 (Quick Start)

1.  **环境配置**:
    *   复制 `template.env` 为 `.env`。
    *   填入你的 Supabase 项目 URL 和 Anon Key：
        ```properties
        VITE_SUPABASE_URL=your_supabase_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **运行项目**:
    *   使用 HBuilderX 打开项目运行，或使用命令行启动开发服务器。