# Supabase Deployment Guide

本指南将帮助您将数据库架构（Schema）部署到您的 Supabase 项目中。

## 1. 准备工作

1.  登录 [Supabase Dashboard](https://supabase.com/dashboard)。
2.  创建一个新项目（New Project）。
3.  获取项目的 `URL` 和 `anon public key`。
4.  将这两个值填入本项目根目录下的 `.env` 文件中：
    ```properties
    VITE_SUPABASE_URL=your_url_here
    VITE_SUPABASE_ANON_KEY=your_key_here
    ```

## 2. 部署数据库架构

我们提供了一个 SQL 脚本来一次性建立所需的所有表、关系和安全策略（RLS）。

1.  在 Supabase Dashboard 左侧菜单栏点击 **SQL Editor** (图标类似 `>_`)。
2.  点击 **New Query**。
3.  打开本项目中的 `supabase/schema.sql` 文件，复制所有内容。
4.  将内容粘贴到 Supabase 的 SQL 编辑器中。
5.  点击右下角的 **Run** 按钮执行脚本。
6.  如果显示 "Success"，则说明数据库结构创建成功。

## 3. 添加测试数据 (可选)

为了让应用立即运行起来，您可能需要手动添加一些初始数据：

1.  **创建题库**:
    *   去 **Table Editor** -> `question_banks` 表。
    *   插入一行：`name` = "公共题库", `description` = "测试用".
    *   复制生成的 `id` (例如: `bank_uuid`).

2.  **创建组织**:
    *   去 `organizations` 表。
    *   插入一行：`name` = "开放测试组", `allow_join` = `TRUE`.
    *   复制生成的 `id` (例如: `org_uuid`).

3.  **关联组织和题库**:
    *   去 `organization_banks` 表。
    *   插入一行：`organization_id` = `org_uuid`, `bank_id` = `bank_uuid`.

4.  **添加题目**:
    *   去 `questions` 表。
    *   插入一行数据示例：
        *   `bank_id`: `bank_uuid`
        *   `type`: `single`
        *   `title`: `1 + 1 等于几?`
        *   `options`: `[{"label":"A","value":"1"},{"label":"B","value":"2"}]` (注意是 JSON 格式)
        *   `answer`: `"B"` (注意 JSON 格式的双引号)
        *   `parse`: `基础数学题`

## 4. 用户注册测试

1.  运行 UniApp 项目。
2.  进入注册页面创建一个新用户。
3.  如果在 Supabase 的 `auth.users` 和 `public.profiles` 表中都能看到该用户数据，说明触发器配置成功。
4.  在应用首页，您应该能看到"开放测试组"，点击加入即可开始测试。

## 5. 配置管理员 (Optional)

如果您希望某个用户拥有管理员权限，可以在 Supabase Dashboard 中手动修改其角色：

1.  在 Supabase Dashboard 左侧菜单栏点击 **Table Editor**。
2.  找到并点击 `public.profiles` 表。
3.  找到您想要设置为管理员的用户对应的行。
4.  编辑该行中的 `role` 字段，将其值从 `user` 修改为 `admin`。
5.  保存更改。
6.  该用户再次登录应用后，将拥有访问管理员页面的权限。
