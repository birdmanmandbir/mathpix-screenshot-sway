#!/bin/bash
# 依赖: grim, slurp, bun, wl-clipboard
# 确保已安装bun和相关依赖

# 设置临时文件路径
SCR="$HOME/screenshot-$(date +%s).png"

# 显示通知
notify-send "截图OCR" "请选择要识别的区域" -t 2000

# 使用grim和slurp获取截图
grim -g "$(slurp)" "$SCR"

# 检查截图是否成功
if [ ! -f "$SCR" ]; then
    notify-send "截图OCR" "截图失败" -u critical
    exit 1
fi

notify-send "截图OCR" "正在处理图像..." -t 2000

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查是否已安装依赖
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    notify-send "截图OCR" "正在安装依赖..." -t 2000
    cd "$SCRIPT_DIR" && bun install
fi

# 使用Bun运行TypeScript脚本
TEXT_RESULT=$(cd "$SCRIPT_DIR" && bun run mathpix_ocr.ts "$SCR" --text-only)

# 检查OCR是否成功
if [ -z "$TEXT_RESULT" ]; then
    notify-send "截图OCR" "OCR识别失败或结果为空" -u critical
    rm "$SCR"
    exit 1
fi

# 复制结果到剪贴板
echo "$TEXT_RESULT" | wl-copy

# 显示通知
notify-send "截图OCR" "识别完成，结果已复制到剪贴板" -t 3000

# 清理临时文件
rm "$SCR"

exit 0 