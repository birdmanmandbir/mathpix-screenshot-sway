# Mathpix OCR 脚本

这是一个简单的工具集，用于调用Mathpix API对图像进行OCR（光学字符识别），特别适用于包含数学公式的图像。使用TypeScript编写，通过Bun运行。

## 前提条件

- [Bun](https://bun.sh/) 运行时
- Mathpix API密钥（需在.env文件中配置）
- 对于截图功能（Wayland环境）：grim, slurp, wl-clipboard

## 安装

1. 克隆或下载此仓库

2. 安装Bun（如果尚未安装）：
```bash
curl -fsSL https://bun.sh/install | bash
```

3. 安装依赖：
```bash
bun install
```

4. 确保.env文件中包含您的Mathpix API密钥：
```
APIKEY=your_api_key_here
```

5. 为脚本添加执行权限：
```bash
chmod +x mathpix_ocr.ts mathpix_screenshot_ocr.sh
```

## 使用方法

### 方法1：处理现有图像文件

基本用法：
```bash
bun mathpix_ocr.ts <图像文件路径>
```

命令行选项：
```
--text-only         只输出纯文本结果
--format FORMAT     指定输出格式，可选值: text, latex, html, json
```

例如：

```bash
# 默认输出（所有格式）
bun mathpix_ocr.ts example.png

# 只输出纯文本
bun mathpix_ocr.ts example.png --text-only

# 只输出LaTeX格式
bun mathpix_ocr.ts example.png --format latex

# 输出JSON格式
bun mathpix_ocr.ts example.png --format json
```

### 方法2：截图并立即OCR

```bash
./mathpix_screenshot_ocr.sh
```

执行此脚本后：
1. 会提示您选择屏幕区域进行截图
2. 如果是首次运行，脚本会安装必要的依赖
3. 自动对截图进行OCR处理
4. 将识别结果复制到剪贴板
5. 显示通知提示处理完成

## 构建

如果需要，您可以将TypeScript脚本构建为JavaScript：

```bash
bun run build
```

这将在当前目录生成`mathpix_ocr.js`文件。

## 输出

脚本将根据选择的选项输出以下内容：

- 提取的纯文本（默认或使用 `--text-only`）
- LaTeX格式（使用 `--format latex`）
- HTML格式（使用 `--format html`）
- 完整的API响应（使用 `--format json`）

## 注意事项

- 支持的图像格式：PNG、JPG、JPEG
- 确保图像清晰可读，以获得最佳OCR结果
- Mathpix API可能有使用限制，请查阅其官方文档了解详情
- 此脚本专为Wayland环境设计 