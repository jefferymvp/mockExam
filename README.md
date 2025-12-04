# MockExamApp

这是一个基于 **UniApp** 框架和 **Supabase** 后端服务的模拟考试应用。本项目支持多用户、多组织架构，具备动态题库管理、Excel 批量导入、用户权限管理等高级功能。

## 技术栈 (Tech Stack)

*   **核心框架**: [UniApp](https://uniapp.dcloud.io/) (基于 Vue.js 2.x)
*   **后端服务**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, RLS)
*   **数据处理**: `xlsx` (SheetJS) 用于 Excel 解析
*   **开发语言**: JavaScript (ES6+)
*   **样式语言**: CSS / SCSS

## 功能模块 (Functionality)

### 1. 客户端 (Client)
*   **多组织支持**: 用户可加入不同的组织（学校/班级），在首页自由切换当前组织上下文。
*   **智能考试配置**:
    *   **题库联动**: 自动加载当前组织绑定的题库。
    *   **题型筛选**: 支持单选、多选、判断题。
    *   **智能题量**: 滑块自动适配题库最大题量，优先推荐 10 题一组的练习模式。
*   **在线答题**:
    *   实时获取试题，支持立即判分与解析显示。
    *   优化的移动端交互体验。

### 2. 管理后台 (Admin Portal)
管理员拥有独立的管理界面，采用底部标签页导航：

#### A. 组织管理
*   **创建/编辑**: 新建组织，开启/关闭组织的“允许加入”通道。
*   **题库配置**: 将现有题库绑定到指定组织，实现资源隔离与共享。

#### B. 用户管理
*   **全员列表**: 查看系统内所有注册用户及其角色（管理员/用户）。
*   **状态控制**: 一键启用或禁用用户账号。
*   **组织分配**: 批量管理用户所属的组织（多选绑定）。

#### C. 题库管理
*   **Excel 导入**: 支持上传 `.xlsx` 文件批量导入题目。
    *   **自动分组**: 根据 Excel 中的“题库名称”列自动创建或匹配多个题库。
    *   **格式要求**: 第一行需包含 `题库名称`、`题型`、`题目`、`选项A`~`D`、`答案`、`解析`。
*   **生命周期管理**:
    *   **启用/禁用**: 控制题库是否对前端用户可见。
    *   **级联删除**: 安全删除题库（自动清除关联的题目和组织绑定关系）。

## 项目结构 (Project Structure)

*   `pages/`
    *   `index/`: 用户首页（组织切换、考试入口）。
    *   `exam/`: 答题核心页面。
    *   `admin/`: 管理员综合控制台（包含三个管理 Tab）。
    *   `login/` & `register/`: 用户认证。
*   `utils/`
    *   `supabase.js`: Supabase 客户端配置（包含 URL 和 Key）。
*   `supabase/`
    *   `schema.sql`: 数据库表结构与 RLS 策略定义。

## 快速开始 (Quick Start)

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **配置 Supabase**:
    *   项目已提供模板文件，请复制 `utils/supabase.js.example` 并重命名为 `utils/supabase.js`。
    *   编辑 `utils/supabase.js`，填入您的 Supabase Project URL 和 Anon Key：
        ```javascript
        const supabaseUrl = 'https://your-project.supabase.co'
        const supabaseKey = 'your-anon-key'
        ```

3.  **运行项目**:
    *   推荐使用 **HBuilderX** 打开项目目录。
    *   点击“运行” -> “运行到浏览器”或“运行到手机模拟器”。

## 导入说明 (Excel Import)

在管理后台导入题库时，请确保 Excel 文件包含以下列名（任选其一即可识别）：
*   **题库列**: `题库` 或 `题库名称` 或 `Bank`
*   **数据列**: `题型` (单选题/多选题/判断题), `题目`, `选项A`...`选项F`, `答案`, `解析`
