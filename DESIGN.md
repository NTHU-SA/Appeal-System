---
version: alpha
name: Neutral Tool UI
description: 白底、中性灰文字、紫調灰表面，搭配單一紫色強調色、以細邊框分層的工具型介面。適用於資料密集的 Web App、後台、目錄瀏覽與規劃工具。
colors:
  # ── 強調色（全站唯一）。主視覺色票：#6E619C
  primary: "#6E619C"
  primary-hover: "#5D4F8B"
  primary-active: "#4D4076"
  on-primary: "#FFFFFF"
  # ── 表面：白底，第二層用紫調灰。主視覺色票：#DCDBE6
  background: "#FFFFFF"
  surface: "#FFFFFF"
  surface-sunken: "#F3F3F7"
  surface-hover: "#F3F3F7"
  surface-active: "#DCDBE6"
  border: "#2D26501F"
  # ── 文字（四階中性灰）。主視覺色票：#303031、#8A8B8C
  text-primary: "#303031"
  text-secondary: "#4D4D4E"
  text-tertiary: "#6C6C6D"
  text-muted: "#8A8B8C"
  # ── 狀態：原色用於圓點與填色；-text 用於亮色模式的文字、圖示與錯誤外框（暗色模式文字直接用原色）
  success: "#5CC184"
  success-text: "#16884F"
  warning: "#E7C869"
  warning-text: "#8D7102"
  danger: "#E17E6D"
  danger-text: "#B85A4A"
  danger-hover: "#A44839"
  info: "#67B5E1"
  info-text: "#2C7DA7"
  highlight: "#9281D4"
  highlight-text: "#7A69BA"
  # ── 分類資料色：依 1 → 8 的順序循環使用，冷暖交錯
  data-1: "#9281D4"  # 薰衣草紫
  data-2: "#E17E6D"  # 珊瑚紅
  data-3: "#A4E9DB"  # 薄荷綠
  data-4: "#E7C869"  # 芥末黃（新增）
  data-5: "#67B5E1"  # 天空藍（新增）
  data-6: "#E391B8"  # 莓果粉（新增）
  data-7: "#5CC184"  # 草綠
  data-8: "#C5997A"  # 駝色
  on-data: "#1F1F20"  # 資料色色塊上的文字，8 色上都 ≥ 4.5:1
  # ── 暗色模式對應
  primary-hover-dark: "#796DA8"
  primary-text-dark: "#9A8FC8"
  background-dark: "#141317"
  surface-dark: "#141317"
  surface-sunken-dark: "#0B0B0E"
  surface-hover-dark: "#242329"
  surface-active-dark: "#35343B"
  border-dark: "#FFFFFF1A"
  text-primary-dark: "#F1F3F5"
  text-secondary-dark: "#D1D1D2"
  text-tertiary-dark: "#A4A4A6"
  text-muted-dark: "#717173"
  # ── 主視覺幾何色塊：只用於行銷頁與活動視覺，不用於 UI 元件、文字、圖表
  shape-lavender: "#9281D4"
  shape-mint: "#A4E9DB"
  shape-coral: "#E17E6D"
  shape-tan: "#C5997A"
  shape-green: "#5CC184"
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.25
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 660
    lineHeight: 1.2
    fontFeature: '"cv05", "cv06", "cv12", "cv13", "ss07"'
  wordmark:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 580
    lineHeight: 1
    fontFeature: '"cv05", "cv06", "cv12", "cv13", "ss07"'
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 580
    lineHeight: 1.25
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.25
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 660
    lineHeight: 1
    fontFeature: '"cv05", "cv06", "cv12", "cv13", "ss07"'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.25
  control:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.25
  overline:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.5px
rounded:
  sm: 4px
  md: 6px
  lg: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 40px
  4xl: 48px
  5xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
  button-secondary-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.text-primary}"
  button-tertiary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-danger:
    backgroundColor: "{colors.danger-text}"
    textColor: "{colors.on-primary}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
    textColor: "{colors.on-primary}"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-tertiary}"
    rounded: "{rounded.sm}"
    size: 32px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-secondary}"
  badge:
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 2px 8px
  toast:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 10px 12px
  notice:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 10px 12px
  calendar-event:
    backgroundColor: "{colors.data-1}"
    textColor: "{colors.on-data}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: 4px 6px
  nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  nav-item-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
  menu:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 4px
  menu-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 30px
    padding: 0 12px
  menu-item-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
  segmented-control:
    backgroundColor: "{colors.surface-hover}"
    rounded: "{rounded.full}"
    padding: 3px
  segmented-control-item:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px 10px
  segmented-control-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
  checkbox:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    size: 16px
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    width: 512px
  tooltip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
    width: 256px
  nav-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    padding: 12px
  side-panel:
    backgroundColor: "{colors.surface}"
    width: 384px
---

## Overview

**冷靜、精確、讓資料說話的工具型介面。** 畫面以白底和中性灰文字為主，第二層表面帶一點紫調，唯一的強調色是紫色。層次靠細邊框與四階灰色文字建立，而不是陰影或大量色塊。所有可點擊的元素同高、圓角小、反應快。整體感受接近桌面應用程式，而不是行銷網站。

### 設計原則

1. **單一強調色。** `{colors.primary}` 只代表「可以互動」或「目前選取」。其他彩色只留給資料（狀態、分類），以及行銷頁的主視覺色塊。
   理由：使用者不必學習顏色代表什麼，資料的顏色也會因此更醒目。
2. **用線分層，不用陰影。** 區塊之間用 1px `{colors.border}` 分隔，卡片沒有陰影。陰影只留給浮在畫面上方的元素。
   理由：畫面乾淨，層級一眼可辨，明暗模式都穩定。
3. **用灰階做文字層級。** 四階文字色（primary → secondary → tertiary → muted）先於字級變化。
   理由：不必放大字也能區分重要性，版面保持緊湊。
4. **控制項同高。** 按鈕、輸入框、導覽項目、圖示按鈕一律 32px 高。
   理由：任意組合放在同一列都能自然對齊。
5. **微動態。** 顏色變化 100ms，位移不超過 2px，縮放不小於 0.9。
   理由：介面跟手，但不表演、不讓人等待。
6. **工具頁像桌面 App。** 整頁不捲動，固定寬度的側欄搭配自適應主區，每欄各自捲動。
   理由：操作中的工具列與清單永遠留在原位，不會被捲走。
7. **只用語意 token。** 元件只引用語意 token（例如 `{colors.border}`），不直接寫色值。明暗模式只在 token 層切換。
   理由：換主題或換色票時，元件程式碼一行都不用改。

### 適用範圍

- **適合：** 資料密集的 Web App、後台與儀表板、目錄與搜尋介面、排程與規劃工具。
- **不適合：** 品牌表現強烈的活動頁、以圖像為主的內容網站、遊戲化介面。若產品也有行銷頁，品牌表現集中在 Hero 區的幾何色塊（見 Layout › Marketing Page），工具頁本身維持安靜。

## Colors

### 色彩來源

UI 骨架來自主視覺色票的五個顏色，其餘的階層都從這五色衍生：

| 主視覺色票 | 對應 token | 衍生方式 |
|---|---|---|
| 紫 `#6E619C` | `primary` | 同色相加深兩階做 hover / active；暗色模式另做兩個較亮的階 |
| 炭黑 `#303031` | `text-primary` | 往淺色方向補 `text-secondary`、`text-tertiary` 兩階中性灰 |
| 淡紫灰 `#DCDBE6` | `surface-active` | 往白色方向補一階更淡的紫調灰 `#F3F3F7`，當 `surface-sunken` 與 `surface-hover` |
| 白 | `background` / `surface` | 頁面底色統一用純白 `#FFFFFF` |
| 灰 `#8A8B8C` | `text-muted` | 原色對比只有 3.4:1，只能當 placeholder 與停用文字；可閱讀的說明文字改用加深的 `text-tertiary` |

**配色原則：文字用中性灰，表面用紫調灰。** 文字保持中性，閱讀起來最乾淨；淡淡的紫調只出現在 hover、按下、凹陷區塊這些表面上，讓整個系統「看起來中性，但隱約帶著品牌紫」。

**狀態色與分類資料色**來自主視覺第二組的五個顏色（薰衣草紫、珊瑚紅、薄荷綠、駝色、草綠），再補上芥末黃、天空藍、莓果粉三個色相。新增的三色明度與彩度都對齊原本五色，8 色看起來是同一組。

### 色彩角色

| Token | 角色 | 使用規則 |
|---|---|---|
| `primary` / `-hover` / `-active` | 唯一強調色 | 只用於主要按鈕、focus 外框、選取指示線、開關與勾選、文字連結 |
| `on-primary` | 主色上的文字或圖示 | 與 `primary` 的對比必須 ≥ 4.5:1 |
| `background` | 頁面底色 | 純白，最底層 |
| `surface` | 卡片、面板、導覽列、浮層 | 和 `background` 同色，靠邊框區分 |
| `surface-sunken` | 比 surface 低一層的底 | 公告列、分段控制的外框底、表格標題列 |
| `surface-hover` / `surface-active` | 中性元素的 hover / 按下底色 | 只在互動時出現 |
| `border` | 所有分隔線與外框 | 一律使用 12% 透明的深紫灰（暗色模式為 10% 透明白） |
| `text-primary` | 標題、主要文字、hover 後的文字 | — |
| `text-secondary` | 描述段落、次要內文 | — |
| `text-tertiary` | 一般說明、meta 資訊、未選取的導覽與圖示 | — |
| `text-muted` | placeholder、停用狀態、純裝飾文字 | **不得**用於需要閱讀的資訊，因為對比不到 4.5:1 |
| `success` / `warning` / `danger` / `info` | 狀態色的原色 | 圓點、進度條、填色。不做大面積底色 |
| `*-text` | 狀態色的文字階 | 亮色模式下的狀態文字、圖示、錯誤外框；暗色模式直接用原色 |
| `highlight` / `highlight-text` | 新功能提示 | 只用於「NEW」這類弱提示 |
| `data-1` … `data-8` | 分類資料色 | 課表色塊、圖表數列、使用者標籤，依序循環 |
| `on-data` | 資料色塊上的文字 | 在 8 個資料色上都 ≥ 4.5:1 |
| `shape-*` | 主視覺幾何色塊 | 只用於行銷頁與活動視覺，見 Layout › Marketing Page |

### 使用規則

- **強調色的面積要小。** 不要把 `primary` 當大面積背景。
- **頁面底色用純白，不用灰底。** 工具頁靠邊框分層；若再墊一層灰底，白色面板與灰色縫隙交錯，資料密集的畫面會顯得零碎。灰色留給 `surface-sunken` 這種「刻意凹下去」的區塊。
- **邊框一律用 `border`**，不要用不透明的灰色。透明邊框疊在任何表面上都一致。
- **文字對比**：`text-primary`、`text-secondary`、`text-tertiary` 在它所在的表面（包括 `surface-sunken`）上都必須 ≥ 4.5:1。
- **紫色文字放在紫調灰上要加深**：`primary` 在 `surface-active`（`#DCDBE6`）上只有 4:1，這時文字改用 `primary-hover`。
- **淡底標籤（Badge）**：底色用該色的「淡底」階，文字用「文字」階（見下方「色階」）。不要直接用原色當文字：8 個原色在白底上都不到 4.5:1。不加同色外框。
- **互動狀態的推導**：hover 比預設深一階，active 再深一階。暗色模式的 hover 改成**亮一階**。

### 狀態色

| 狀態 | 原色 | 文字（亮色模式） | 用在哪裡 |
|---|---|---|---|
| 成功 `success` | 草綠 `#5CC184` | `#16884F` | 開放、正常、已完成 |
| 警告 `warning` | 芥末黃 `#E7C869` | `#8D7102` | 快滿、即將截止、回應變慢 |
| 危險 `danger` | 珊瑚紅 `#E17E6D` | `#B85A4A` | 額滿、錯誤、破壞性動作 |
| 資訊 `info` | 天空藍 `#67B5E1` | `#2C7DA7` | 候補、維護公告、一般通知 |
| 新功能 `highlight` | 薰衣草紫 `#9281D4` | `#7A69BA` | 「NEW」標記 |

- **狀態色只用在圓點、圖示、短文字與進度條上。** 不做大面積的底色，也不要和同色外框組成提示框（見 Components › Feedback）。
- **警告用偏黃的芥末黃**，不用駝色。駝色的深色階會變成咖啡色，讀起來像「土」而不是「注意」。
- **薰衣草紫只當「新功能」提示。** 它和主色紫是同一個色相，當一般狀態色容易被誤認為「可以點擊」。
- **危險按鈕**的底色用 `danger-text`。珊瑚紅原色配白字只有 2.9:1。
- **暗色模式**下，狀態文字直接使用原色；8 個原色在暗色底上都 ≥ 4.5:1。
- 狀態不能只靠顏色傳達，一定搭配文字。

### 分類資料色（8 色）

分類色的工作是讓同一個畫面上的不同項目一眼分得開。顏色數量至少要等於畫面上同時出現的項目數，否則就會撞色。需要 8 色的原因：

- **課表**：一學期常修 6～8 門課，再加上社團、打工等自訂事件。
- **趨勢與比較圖**：常見同時比較 4～8 條數列。
- **標籤與收藏夾**：使用者自己挑顏色，選項太少很快就重複。
- **上限**：超過 8～10 色後人眼很難再分辨。

| 順序 | 名稱 | 原色 | 冷暖 | 來源 |
|---|---|---|---|---|
| `data-1` | 薰衣草紫 | `#9281D4` | 冷 | 主視覺 |
| `data-2` | 珊瑚紅 | `#E17E6D` | 暖 | 主視覺 |
| `data-3` | 薄荷綠 | `#A4E9DB` | 冷 | 主視覺 |
| `data-4` | 芥末黃 | `#E7C869` | 暖 | 新增 |
| `data-5` | 天空藍 | `#67B5E1` | 冷 | 新增 |
| `data-6` | 莓果粉 | `#E391B8` | 暖 | 新增 |
| `data-7` | 草綠 | `#5CC184` | 冷 | 主視覺 |
| `data-8` | 駝色 | `#C5997A` | 暖 | 主視覺 |

- **依 1 → 8 的順序分配**，用完再從頭循環。順序冷暖交錯，相鄰的項目一冷一暖。
- **最接近的一組是珊瑚紅與駝色**（兩者都是暖色、明度接近），所以排在第 2 與第 8，讓它們相隔最遠。做大色塊沒問題，但在小圓點和細線上要留意。
- **不要再加第 9 色。** 超過 8 項時，第 9 項以後歸為「其他」並用中性灰，或改用文字分組。
- 分類色和狀態色共用部分色相。在課表、圖表這類情境裡，綠色色塊不代表「成功」；需要表達狀態時一定搭配文字。
- **不要把 `shape-*` 主視覺色當成資料色或狀態色使用。** 兩者數值部分相同，但用途分開管理。

### 色階：一個顏色，四種用途

每個狀態色與分類色都衍生出四個色階：

| 色階 | 用途 | 亮色模式怎麼來 | 暗色模式 |
|---|---|---|---|
| **原色** | 色塊、圓點、進度條填色 | 原色 | 原色 |
| **文字** | 文字、圖示、錯誤外框（需要 4.5:1） | 沿同一色相加深明度，直到對白底達到 4.5:1 | 直接用原色 |
| **細線** | 折線、圖表上的細圖形（需要 3:1） | 沿同一色相加深明度，直到對白底達到 3:1 | 直接用原色 |
| **淡底** | 標籤底色 | 原色 16% 混入白色 | 原色 22% 混入暗色底 `#141317` |

計算後的數值：

| 名稱 | 原色 | 文字（亮） | 細線（亮） | 淡底（亮） | 淡底（暗） |
|---|---|---|---|---|---|
| 薰衣草紫 | `#9281D4` | `#7A69BA` | `#9281D4` | `#EEEBF8` | `#302B41` |
| 珊瑚紅 | `#E17E6D` | `#B85A4A` | `#DA7867` | `#FAEAE8` | `#412B2A` |
| 薄荷綠 | `#A4E9DB` | `#3D8175` | `#5C9F92` | `#F0FBF9` | `#344242` |
| 芥末黃 | `#E7C869` | `#8D7102` | `#B0922E` | `#FBF6E7` | `#423B29` |
| 天空藍 | `#67B5E1` | `#2C7DA7` | `#4D9CC7` | `#E7F3FA` | `#263743` |
| 莓果粉 | `#E391B8` | `#AB5E84` | `#CB7CA2` | `#FBEDF4` | `#422F3A` |
| 草綠 | `#5CC184` | `#16884F` | `#40A76C` | `#E5F5EB` | `#24392F` |
| 駝色 | `#C5997A` | `#956C4E` | `#B58A6B` | `#F6EFEA` | `#3B302D` |

- **色塊上的文字**一律用 `on-data`（`#1F1F20`），不用白字。白字在 8 個原色上都低於 3.4:1。

### 暗色模式

| 亮色 token | 暗色 token | 說明 |
|---|---|---|
| `background` / `surface` | `background-dark` / `surface-dark` | 帶一點紫調的近黑，不用純黑；兩者同色，同樣靠邊框分層 |
| `surface-sunken` | `surface-sunken-dark` | 比表面更深 |
| `surface-hover` / `-active` | `surface-hover-dark` / `-active-dark` | 越互動越亮 |
| `border` | `border-dark` | 10% 透明白 |
| `text-*` | `text-*-dark` | 四階順序不變；最亮的文字用主視覺的淺灰 `#F1F3F5`，比純白柔和 |
| `primary-hover` | `primary-hover-dark` | 按鈕 hover 變亮而不是變暗 |
| `primary`（當文字） | `primary-text-dark` | `primary` 在暗底上只有 3.4:1，所以連結、選取線、紫色文字在暗色模式改用這個較亮的紫 |
| 狀態與分類色的 `*-text` | 原色 | 原色在暗色底上已經夠亮，文字、圖示、細線都直接用原色；淡底見「色階」表 |

- 主要按鈕在暗色模式仍使用 `primary` 底色加白字。
- 用 `data-theme="light"` 或 `data-theme="dark"` 切換。未設定時跟隨系統設定。
- 主題選單提供 Light / Dark / System 三個選項，並記住使用者的選擇。
- 任何區塊都可以用 `data-theme` 局部強制成某個主題，例如行銷頁的 Hero。

### 調整色票時的檢查清單

1. 主色至少要有四個明度階（暗色 hover 用的亮版、預設、hover、active），而且 `primary` 要能和白字達到 4.5:1。
2. 確認四階文字色在 `surface` 和 `surface-sunken` 上的對比。
3. 執行 `npx -p @google/design.md designmd lint DESIGN.md`，查看對比警告。

## Typography

### 字體

- **Inter（可變字體 InterVariable）**，後備字體為 `system-ui, sans-serif`。
- 標題與 wordmark 開啟 OpenType 特性 `cv05 cv06 cv12 cv13 ss07`：帶尾鉤的小寫 l、簡化的 u、緊湊的 f 與 t、方形標點。這是讓 Inter 有自己個性的關鍵。
- 善用可變字體的**中間字重**：580 用於 wordmark 與對話框標題，660 用於卡片與頁面標題。它們比標準字重更細緻，層級分明但不吵。

### 字級

| Token | 規格 | 用途 |
|---|---|---|
| `display` | 48 / 600 / 1.1 | 行銷頁 Hero 主標（手機縮為 32px） |
| `headline-lg` | 32 / 500 / 1.25 | 行銷頁區塊標題 |
| `headline-md` | 24 / 660 | 工具頁的詳細頁主標 |
| `wordmark` | 24 / 580 | 產品名稱 logo 文字 |
| `title-lg` | 20 / 580 | 對話框標題 |
| `title-md` | 18 / 500 | 手風琴（Accordion）標題、小節標題 |
| `title-sm` | 16 / 660 | 卡片標題 |
| `body-lg` | 16 / 400 / 1.5 | 行銷頁段落、長文 |
| `body-md` | 14 / 400 / 1.5 | **預設內文**、選單項目 |
| `body-sm` | 13 / 400 / 1.5 | 密集介面文字：表格、卡片描述、標籤、公告列、Toast |
| `label-md` | 14 / 500 | 欄位標籤、頁尾欄標題、分段控制 |
| `control` | 13 / 500 / 1 | 按鈕、導覽項目、分頁 tab |
| `caption` | 12 / 400 | 輔助說明、密集資料中的小字 |
| `overline` | 11 / 600 / 全大寫 / 字距 0.5px | 選單分組標題 |

### 規則

- 預設內文用 `body-md`（14px）。只有在閱讀型內容裡才用 `body-lg`。
- 控制項文字一律用 `control`，行高設為 1，元件高度由元件本身決定。
- 層級優先用**文字顏色與字重**區分，不要靠一直加大字級。
- 全大寫只用在 `overline`，而且一定要搭配 0.5px 字距。
- 單行標題或描述超出寬度時用省略號截斷。段落最大寬度約 500～680px。
- 觸控裝置上，輸入框字級至少 16px，避免 iOS 聚焦時自動放大畫面。

## Layout

### 間距

採用 **4px 網格**。所有間距都從 spacing token 取值：

| Token | 值 | 常見用途 |
|---|---|---|
| `xs` | 4px | 圖示與文字的緊密間距、選單內距 |
| `sm` | 8px | **預設元素間距**、按鈕內圖示與文字的間距 |
| `md` | 12px | 控制項的左右內距、清單項目間距、meta 資訊列的間距 |
| `lg` | 16px | 卡片內距、表單欄位間距 |
| `xl` | 24px | 面板內距、窄螢幕的頁面左右留白 |
| `2xl` | 32px | 大區塊內的群組間距 |
| `3xl` | 40px | 桌面版頁面左右留白 |
| `4xl` | 48px | 行銷頁區塊的上下間距 |
| `5xl` | 64px | 頁尾上下內距與欄距 |

### 固定尺寸

| 項目 | 尺寸 |
|---|---|
| 控制項高度（按鈕、輸入框、導覽項目） | 32px；觸控裝置的點擊範圍至少 44px |
| 選單項目高度 | 30px |
| 圖示 | 16px（行內 meta 用 14px，導覽列用 18px） |
| 標準側欄 / 清單欄 | 384px |
| 篩選欄 | 360px |
| 浮動面板（Popover） | 320～400px |
| 對話框 | 512px（距離螢幕邊緣至少 24px） |
| Tooltip 最大寬度 | 256px |
| 空狀態文字最大寬度 | 448px |
| 閱讀內容最大寬度 | 680px |

### 斷點

| 名稱 | 條件 | 行為 |
|---|---|---|
| `phone` | ≤ 520px | 單欄；按鈕可以撐滿寬度 |
| `mobile` | ≤ 768px | 隱藏公告列；多欄版面只顯示清單或詳細其中一欄；Hero 縮短；兩欄內容區塊改成單欄置中 |
| `tablet` | ≤ 992px | 導覽收合成漢堡選單；側欄改成抽屜；頁面左右留白從 40px 改為 24px |
| `desktop` | > 992px | 完整的多欄版面 |
| `wide` | ≥ 1280px | 可以加開一欄，或加寬主區 |

- 高度使用 `100dvh` 或 `100svh`，避免手機瀏覽器網址列造成畫面跳動。

### Pattern: App Shell

```
┌────────────────────────────────────────────┐
│ 公告列（可選，surface-sunken，≤768px 隱藏）  │ ← 整組 sticky，高度寫入
│ 導覽列                                      │   --header-height
├────────────────────────────────────────────┤
│ 頁面內容                                     │
├────────────────────────────────────────────┤
│ 頁尾（只出現在行銷頁與內容頁）                │
└────────────────────────────────────────────┘
```

- **導覽列**
  - 左側放 `wordmark`；右側依序放導覽項目、主題切換按鈕、主要 CTA（primary 按鈕）。
  - 內距 12px，底部一條 1px `border`。
  - **選取指示**：在選取的項目下方畫一條 2px 的 `primary` 底線，位置剛好和導覽列底邊框重疊。
  - hover 時用一層 `surface-hover` 圓角底色淡入。
- **≤ 992px**：導覽項目收進漢堡按鈕，點開後是全螢幕選單，連結用 24px / 500 的大字，從頁首高度下方開始排列。
- **反白版本**：導覽列疊在彩色背景上時，文字改白、hover 改用半透明白，選取線移到上方。

### Pattern: Master–Detail（工具頁）

適用情境：瀏覽大量同類項目，並查看單筆的詳細內容。

```
┌──────────┬────────────┬──────────────────────────────┐
│ 篩選欄    │ 清單欄      │ 詳細區                        │
│ 360px    │ 384px      │ 自適應寬度                    │
│          │ ┌────────┐ │ ┌──────────────────────────┐ │
│          │ │ 卡片    │ │ │ 標題 headline-md          │ │ ← sticky
│          │ └────────┘ │ │ meta 資訊 · 動作按鈕       │ │
│          │ ┌────────┐ │ │ 分頁 tab（滑動的指示線）    │ │
│          │ │ 卡片    │ │ ├──────────────────────────┤ │
│          │ └────────┘ │ │ 內容（自己捲動）            │ │
└──────────┴────────────┴──────────────────────────────┘
```

- **整頁**：高度 `100dvh − 頁首高度`，整頁不捲動，每欄各自捲動。欄與欄之間用 1px `border` 分隔。
- **清單欄**
  - 左右內距 12px，卡片間距 8～12px。
  - 捲動後，頂部搜尋區的下緣淡入一條約 18px 的漸層遮罩，提示「上方還有內容」。
- **清單卡片**
  - 第 1 列：`title-sm` 標題，右側放一個彩色的狀態值。
  - 第 2 列：`text-secondary` 描述，單行省略。
  - 第 3 列：`caption` 或 `body-md` 的 meta 資訊列，每項都是 14px 圖示加文字，項目間距 12px。
  - 選取時卡片外框改成 `primary`。
- **詳細區**
  - 頂部是 sticky 標題列，底部一條 `border`。
  - 分頁 tab 的選取指示線是一條獨立的 2px 圓角線，切換分頁時**滑動**到新的 tab。
- **≤ 992px**：篩選欄改成從左側滑入的抽屜（384px），後方加上遮罩。
- **≤ 768px**：一次只顯示清單或詳細其中一欄。

### Pattern: Sidebar + Canvas（編輯器）

適用情境：行事曆、地圖、排程、視覺化編輯器。

- 左側是 384px 的 `side-panel`，放清單或設定；右側是自適應的畫布。
- 畫布上的項目色塊依序使用**分類資料色** `data-1` → `data-8`。規格見 Components › Data Visualization 的「課表色塊」。
- 沒有被聚焦的項目降到 50% 透明度；聚焦的項目維持 100%。

### Pattern: Marketing Page（行銷頁）

- **Hero**
  - 高度接近一整個螢幕（`100svh − 頁首高度`），內容貼齊**左下角**，內距 48px（≤ 992px 時改為 24px）。
  - 底色用 `background`（純白）。整個 Hero 用 `data-theme="light"` 固定為亮色，暗色模式也不變，確保色塊與文字的對比一致。
  - 主視覺是**大型幾何色塊**，顏色只取 `shape-*` 五色：
    - 形狀：圓環、四角星、多邊形（例如八角形）、三角形、斜切的四邊形。
    - 平塗填色，不加外框、陰影或漸層。
    - 每個構圖放 3～7 個色塊，大小不一、可以自由旋轉、可以互相重疊，也可以超出畫面邊緣被裁切。
    - 同一個構圖可以重複使用同一色，但相鄰的色塊不要同色。
  - 主標用 `display`、`text-primary`，可以手動斷行。文字可以和色塊交疊，但關鍵字不能被完全遮住。
  - 色塊上的文字**一律用深色 `text-primary`，不用白字**。白字在五個色塊上的對比都低於 3.4:1（薄荷色只有 1.4:1）；深色字在色塊上為 4～9.6:1，足以用於大字級標題。內文字級不得放在色塊上。
  - 可以選擇性地加上一層「重複排列的細體大字」作為底紋，與色塊交錯，重現海報式的排版質感。
  - ≤ 768px：色塊減少到 2～4 個，並移到標題周圍，不要壓在標題上。
- **內容區塊**
  - 統一內距：上下 48px、左右 40px。
  - 兩種版型交替使用：
    - **置中型**：標題、段落（最大寬 500px）、一個按鈕。
    - **左右兩欄型**：左邊放標題和說明（最大寬 400px），右邊放內容（最大寬 680px），例如手風琴或 logo 列。
  - ≤ 768px：兩欄改成單欄置中，並隱藏次要說明。

### Pattern: Footer（頁尾）

- 上方一條 1px `border`，上下內距 64px，欄與欄間距 64px（手機 48px）。
- 左側品牌區：`wordmark`、一句描述，以及系統狀態徽章（32px 高、`surface-hover` 底、8px 狀態燈）。
- 右側連結欄：欄標題用 `label-md` + `text-primary`，連結用 `body-md` + `text-tertiary`，hover 時變成 `text-primary`。
- 最底一列：版權宣告和法律連結，左右對齊。

## Elevation & Depth

- **預設沒有陰影。** 頁面上的區塊與卡片只用 1px `border` 區分層級。
- **陰影只用在浮層**，而且要非常淡：

| 層級 | 元素 | 亮色模式陰影 |
|---|---|---|
| 1 | Tooltip | `0 0 12px rgb(0 0 0 / 6%)` |
| 2 | 下拉選單、Popover | `0 4px 12px rgb(0 0 0 / 10%)` |
| 3 | 大型選單、可搜尋的下拉 | `0 8px 16px rgb(0 0 0 / 12%)` |
| — | 分段控制的選中項目 | 三層疊加：`0 3px 2px /6%`、`0 3px 8px /15%`、`0 0 1px /4%` |

- **暗色模式**：陰影在暗底上看不見，所以要加深（例如 `0 12px 24px rgb(0 0 0 / 50%)`），並加一圈 `0 0 0 1px rgb(255 255 255 / 8%)` 的描邊。
- **對話框遮罩**：用 `background` 色加 90% 不透明度，做出「霧面」效果，不要用黑色半透明。

### 圖層順序（z-index）

只用於掛在 body 最外層的元素。元件內部的堆疊一律只用 1、2、3。

`一般 fixed 元素 100` < `導覽 200` < `遮罩 300` < `對話框 400` < `Popover / 下拉 500` < `Toast 600` < `Tooltip 700` < `手機全螢幕選單 800` < `sticky 頁首 900` < `頁首內的下拉 1000`

## Shapes

| Token | 用途 |
|---|---|
| `sm` 4px | 按鈕、輸入框、Badge、Tooltip、畫布色塊、骨架屏 |
| `md` 6px | 選單內的項目、小型標籤按鈕 |
| `lg` 8px | 卡片、對話框、下拉選單、面板 |
| `full` | 分段控制、開關、狀態燈、「NEW」小膠囊 |

- **原則**：越小、越可互動的元素，圓角越小；越大的容器，圓角越大；膠囊類的切換元件用全圓。
- **線寬**：
  - 外框與分隔線：1px。
  - focus 外框：2px，與元素保持 2px 間距。
  - 選取指示線：2px。
- **分類色條**：卡片左側可以加一條 8px 寬的分類色條，用來標示它屬於哪個類別。

## Components

### 共通狀態

| 狀態 | 規則 |
|---|---|
| hover | 背景或文字顏色以 100ms ease-in-out 過渡 |
| active | 比 hover 再深一階 |
| focus-visible | 2px `primary` 外框，間距 2px。**輸入類元件例外**：只把邊框改成 `primary`，不加光暈 |
| disabled | 透明度 50%，不可點擊。外框型按鈕例外：改成 `surface-hover` 底加 `text-muted` 字 |
| loading | 用 16px 的旋轉指示器取代圖示，或用骨架屏佔位 |

### Button

| 變體 | 外觀 | 用途 |
|---|---|---|
| `primary` | 主色底、白字 | 每個區域最多一個的主要動作 |
| `secondary` | 透明底、1px `border`、`text-tertiary` 字 | 一般的次要動作 |
| `tertiary` | 透明底、1px `border`、`primary` 字 | 想強調但不搶過 primary 的動作 |
| `danger` | 把以上任一變體的主色換成 `danger` | 刪除、移除等破壞性動作 |
| `ghost` | 沒有外框也沒有底色 | 工具列、密集清單內 |

- 共通規格：32px 高、左右內距 12px、圓角 `sm`、文字 `control`，圖示與文字間距 8px。
- 只有圖示的按鈕用 `icon-button`，尺寸 32×32，外框樣式同 `secondary`。

### Input / Select

- **Input**：32px 高、1px `border`、圓角 `sm`、內距 0 12px、文字 `text-primary`、placeholder 用 `text-muted`。
- **Select 觸發器**：外觀與 Input 相同。值未選時文字用 `text-muted`，選了之後用 `text-primary`。多選時可以換行長高，選項以 Badge 呈現。
- **Select 選單**
  - 規格同 `menu`，最大高度 300px，項目之間間距 4px。
  - 分組標題用 `overline` + `text-muted`。
  - 可搜尋的版本：頂部放搜尋列（圖示 + 無邊框輸入框，下方一條 `border`），搜尋不到時顯示置中的 `text-muted` 提示文字。

### Card

- 規格：1px `border`、圓角 `lg`、內距 16px、**沒有陰影**。
- 可點擊的卡片：hover 時底色改為 `surface-hover`，選取時外框改為 `primary`。
- 內部結構：
  - 標題：`title-sm`，下方間距 4px。
  - 描述：`text-secondary`。
  - 底部 meta 列：上方間距 12px，項目間距 12px，文字 `text-tertiary`。
  - 右上角放動作圖示。
- 停用的卡片整張轉成灰階。

### Badge

- 規格：內距 2px 8px、圓角 `sm`、文字 `body-sm`。
- 顏色：底色用「淡底」階，文字用「文字」階（亮色模式），見 Colors › 色階。暗色模式文字直接用原色。
- 只有一種樣式，不加同色外框。
- 用途：使用者標籤、收藏夾分類、篩選條件。表格與卡片裡的狀態不用 Badge，改用 Feedback 的「行內狀態」。

### Navigation Item / Tabs

- 規格同 `nav-item`。hover 時用偽元素鋪一層 `surface-hover` 底色並淡入，這樣不會影響排版。
- 選取時文字改成 `text-primary`，並在下方顯示 2px 的 `primary` 指示線。
- 頁內的分頁 tab 用一條獨立的指示線，切換時以動畫滑動到新的 tab。

### Menu / Dropdown

- **容器**：`surface` 底、1px `border`、圓角 `lg`、內距 4px、最小寬 150px、最大高 300px，陰影用層級 2。
- **項目**：30px 高、圓角 `md`，四周留 2px 空隙，讓 hover 時的底色看起來是內縮的。
- **危險項目**：文字用 `danger-text`（暗色模式用 `danger` 原色）。
- **出場動畫**：依彈出方向位移 2px，同時淡入。

### Dialog / Drawer

- **Dialog**
  - 寬 512px、圓角 `lg`、1px `border`，置於畫面正中，遮罩用霧面效果。
  - 頁首：放 `title-lg` 標題與 `label-md` + `text-tertiary` 副標，下方一條 `border`。
  - 頁尾：放動作按鈕，靠右對齊，上方一條 `border`。
- **Drawer**：從左或右側滑入，高度撐滿整個視窗。

### Tooltip

- 最大寬 256px、圓角 `sm`、1px `border`，陰影用層級 1。
- 有標題的版本：標題列用 `label-md`，下方一條 `border`；內文用 `body-md`、行高 1.5、`text-secondary`。
- 顯示延遲約 50ms，要感覺像是立刻出現。

### Segmented Control

- 外層：`surface-hover` 底的膠囊，內距 3px。
- 選中的項目：變成 `surface` 底，加上分段控制專用的三層柔和陰影，看起來像一顆浮起的藥丸。
- 變體：
  - **撐滿寬度**：所有項目等寬。
  - **只有圖示**：每個項目 28×28，外框圓角 `lg`。

### Switch / Checkbox

- **Switch**：27×16 的全圓軌道，關閉時用 `border` 色，開啟時用 `primary`；白色圓鈕 12px，位移動畫 100ms。
- **Checkbox**：16×16、圓角 `sm`。未勾選時是 2px `text-tertiary` 外框；勾選時是 `primary` 底加白色勾。

### Accordion

- 項目之間用 1px `border` 分隔，最後一項不加。
- 觸發列：上下內距 16px，文字 `title-md`，hover 時透明度降到 80%。
- 右側放 20px 的箭頭圖示，展開時旋轉 180°。
- 內容：`body-lg`、行高 1.6，連結用 `primary`。

### Feedback：狀態該怎麼出現

一般的工具與網站很少用「淡色底加同色外框」的提示框。狀態依情境用下面五種方式呈現，彩色只出現在圖示、圓點和短文字上，表面一律維持中性。

以下的「文字階」在亮色模式指 `*-text`（例如 `danger-text`），在暗色模式指原色（例如 `danger`）。

#### 1. 行內狀態（表格、卡片、清單）

```
● 快滿   78/80
```

- 8px 圓點用狀態**原色**，後面接 `body-sm`、字重 500 的狀態文字，文字用**文字階**。
- 旁邊的數字用 `text-tertiary` 和等寬數字，例如 `78/80`。
- 成績、分數這類數值本身可以上色：文字階、字重 660，例如 `B+` 用警告色。
- 範例：開放（成功）、快滿（警告）、額滿（危險）、候補 12 人（資訊）。

#### 2. Toast

```
┌──────────────────────────────────────────┐
│ ✓  已儲存收藏夾「想修的課」          復原 │
└──────────────────────────────────────────┘
```

- 規格同 `toast` 元件：`surface` 底、1px `border`、圓角 `lg`、內距 10px 12px，陰影用 Elevation 層級 2。
- 左側 16px 狀態圖示用文字階；中間是 `text-primary` 的訊息；右側可以放一個文字按鈕（`primary` 色，暗色模式用 `primary-text-dark`），例如「復原」。
- 訊息寫「完成了什麼」，例如「已儲存收藏夾「想修的課」」，不寫「操作成功」。
- 出現在畫面角落，幾秒後自動消失；滑鼠停在上面時暫停計時。

#### 3. 表單驗證

```
學校信箱
┌──────────────────────────────┐   ← 外框改成危險色的文字階
│ student@school               │
└──────────────────────────────┘
⊗ 缺少網域結尾，例如 .edu.tw       ← 12px，危險色的文字階
```

- 錯誤時，輸入框的 1px 外框改成危險色的文字階。
- 下方放 12px 說明文字，同樣用危險色的文字階，前面加一個 16px 的 ✕ 圖示。
- 說明要講清楚「哪裡錯、怎麼修」，例如「缺少網域結尾，例如 .edu.tw」，不要只寫「格式錯誤」。
- 輸入正確時通常不顯示任何提示。

#### 4. 中性公告列

```
┌────────────────────────────────────────────────────┐
│ ⓘ  系統將於 9/18（三）02:00–04:00 維護，期間無法加退選。 │   ← surface-sunken 底，沒有外框
└────────────────────────────────────────────────────┘
```

- 規格同 `notice` 元件：`surface-sunken` 底、**沒有外框**、圓角 `lg`、內距 10px 12px。
- 左側 16px 圖示用對應狀態的文字階；文字維持 `body-sm`、`text-secondary`，不上色。
- 用在頁面或區塊頂部的一般通知，例如維護時間、截止日期：「加選截止：9/20（五）23:59。額滿的班別可以登記候補。」

#### 5. 系統狀態列表

```
● 選課系統正常
● 成績查詢回應較慢
● 課程評價排定維護
```

- 每一列：8px 圓點用狀態原色，後面接 `body-sm`、`text-secondary` 文字。**文字不上色**，只有圓點有顏色。
- 成功＝正常，警告＝部分異常或變慢，資訊＝排定維護。

#### ✕ 避免：淡色底加同色外框的提示框

例如淡藍色底、藍色外框、藍色圖示的「提示框」。即使顏色調得很舒服，這種組合在一般工具與網站裡很少見，是常見的 AI 生成痕跡。需要提示時，改用上面的「中性公告列」或「Toast」。

#### 載入與空狀態

- **骨架屏**：用 `border` 色、圓角 `sm`，2 秒一次的呼吸動畫（透明度 1 → 0.6 → 1）。
- **旋轉指示器**：2px 外框缺一角的圓圈，1 秒轉一圈，有 16px 與 32px 兩種尺寸。
- **空狀態**：置中顯示，文字最大寬 448px，由一個圖示、一行標題、一段 `text-tertiary` 說明、一個按鈕組成（按鈕可省略）。

### Data Visualization

所有圖表與色塊都使用 `data-1` → `data-8`，並依用途選擇色階（見 Colors › 色階）。

- **堆疊進度條**
  - 高 10px，色段之間留 2px 空隙，每段圓角 2px。
  - 色段用原色；還沒完成的部分用 `surface-sunken`。
  - 數字放在圖例裡，不放在色段上。
- **折線圖**
  - 線寬 2px，用「細線」階；在最後一個資料點畫一個半徑 3px 的圓點。
  - 格線用 `border`；座標標籤用 10～11px 等寬字、`text-tertiary`。
- **圖例**：10px 方形色塊，後面接 12px 文字，數值靠右並用等寬數字。
- **課表色塊**
  - 規格同 `calendar-event` 元件：原色填色、圓角 `sm`、內距 4px 6px。
  - 標題 11～12px、字重 600；時間用 10px 等寬字、80% 不透明度。
  - 文字一律用 `on-data`，不用白字。
- **使用者標籤**：用 Badge（淡底＋文字階）。

### Icons

- 使用**線性**圖示集，例如 Iconoir 或 Lucide：圓頭、筆畫 2px、預設尺寸 16px。
- 圖示顏色跟隨文字色：預設 `text-tertiary`，hover 時變成 `text-primary`。
- 同一個產品只用一套圖示集，不要混用填色圖示和線性圖示。

## Motion

| 情境 | 時長與曲線 |
|---|---|
| hover 時顏色、背景、邊框的變化（**預設值**） | 100ms ease-in-out |
| 遮罩淡入淡出、Tooltip 出現 | 100～150ms ease |
| 對話框進場 | 150ms，由 `scale(0.9)` 放大到原尺寸並淡入 |
| 抽屜滑入 | 300ms `cubic-bezier(0.16, 1, 0.3, 1)` |
| 抽屜滑出 | 250ms `cubic-bezier(0.4, 0, 1, 1)` |
| 下拉選單出現 | 約 400ms `cubic-bezier(0.16, 1, 0.3, 1)`，只位移 2px |
| 手風琴展開或收合 | 200ms ease-out |
| 主題切換圖示 | 200ms，從 -90° 旋轉回 0° 並淡入 |

- 動畫只用來表達「元素從哪裡來、往哪裡去」，不做裝飾性動畫。
- 必須尊重 `prefers-reduced-motion`：使用者開啟時，關閉位移與縮放，只保留淡入淡出。

## Accessibility

- 所有可以閱讀的文字，與背景的對比都要 ≥ 4.5:1。`text-muted` 不能用來承載必要的資訊。
- 所有互動元素都要有清楚可見的 `focus-visible` 樣式。不要只拿掉 outline 而不提供替代。
- 觸控裝置上，點擊範圍至少 44×44px。可以靠增加內距或擴大偽元素範圍達成，不一定要放大元件外觀。
- 只有圖示的按鈕必須加上 `aria-label`。
- 狀態不能只靠顏色傳達。分數、容量這類資料要同時顯示文字或數值。

## Do's and Don'ts

### Do

- 讓每個區域最多只有一個 `primary` 按鈕。
- 用 `border` 和四階文字色建立層級。
- 讓同一列的控制項保持 32px 等高。
- 讓工具頁保持安靜：紫色只出現在可互動與選取的地方，品牌表現留給行銷頁的幾何色塊。
- 工具頁鎖定整頁捲動，讓每欄各自捲動。
- 側欄使用固定寬度（360 或 384px），主區自適應。
- 所有顏色變化都加上 100ms 過渡。
- 長字串用省略號截斷，並用 Tooltip 顯示完整內容。
- 狀態用圓點、圖示和短文字表達，而且一定搭配文字。
- 分類色依 `data-1` → `data-8` 的順序分配，讓相鄰項目一冷一暖。

### Don't

- 不要引入第二個強調色，也不要把主色用在大面積背景。
- 不要在工具頁、UI 元件或圖表裡使用 `shape-*` 主視覺色。
- 不要在主視覺色塊上放白字或內文字級的文字。
- 不要在 8 個分類色之外再加顏色；超過 8 項時歸為「其他」或改用文字分組。
- 亮色模式下不要把狀態色或分類色的原色直接當文字，改用文字階。
- 不要在資料色色塊上放白字，改用 `on-data`。
- 不要給卡片或靜態區塊加陰影。
- 不要用「淡色底加同色外框」的提示框，這是常見的 AI 生成痕跡。改用中性底加彩色圖示，或直接用行內文字。
- 不要使用不透明的灰色邊框，或為不同底色挑不同的邊框灰。
- 不要在元件裡直接寫死色值，一律引用 token。
- 不要使用 token 以外的圓角、字級或間距。
- 不要用黑色半透明遮罩。
- 不要使用超過 2px 的位移，或時間超過 400ms 的介面動畫。
- 不要在同一個產品裡混用不同風格的圖示集。
