import streamlit as st
import pandas as pd

def convert_units(value, from_unit):
    """Convert data units to all other units"""
    # Define conversion to bytes
    to_bytes = {
        'Byte': 1,
        'KB': 1024,
        'MB': 1024**2,
        'GB': 1024**3,
        'TB': 1024**4
    }
    
    # Convert input to bytes first
    bytes_value = value * to_bytes[from_unit]
    
    # Convert from bytes to all units
    results = {}
    results['bit'] = bytes_value * 8
    results['Byte'] = bytes_value
    results['KB'] = bytes_value / to_bytes['KB']
    results['MB'] = bytes_value / to_bytes['MB']
    results['GB'] = bytes_value / to_bytes['GB']
    results['TB'] = bytes_value / to_bytes['TB']
    
    return results

def format_number(num):
    """Format numbers for better readability"""
    if num >= 1:
        if num == int(num):
            return f"{int(num):,}"
        else:
            return f"{num:,.3f}"
    else:
        return f"{num:.6f}"

def create_conversion_table(results, base_unit):
    """Create a formatted table for unit conversion results"""
    data = []
    unit_info = {
        'bit': ('ビット', '1Byte = 8bit'),
        'Byte': ('バイト', '1KB = 1024Byte'),
        'KB': ('キロバイト', '1MB = 1024KB'),
        'MB': ('メガバイト', '1GB = 1024MB'),
        'GB': ('ギガバイト', '1TB = 1024GB'),
        'TB': ('テラバイト', '（最大単位）')
    }
    
    for unit, value in results.items():
        reading, note = unit_info[unit]
        if unit == base_unit:
            note = '（基準）'
        
        data.append({
            '単位': unit,
            '読み方': reading,
            '値': format_number(value),
            '備考': note
        })
    
    return pd.DataFrame(data)

# Streamlit App
st.title("情報量の単位変換 📊")
st.caption("Created by Dit-Lab.(Daiki ITO)")
st.caption("Supported by Tomoaki ATSUMI")

st.markdown("---")

# Part 1: Unit Conversion Calculator
st.header("パート1：単位変換カリキュレーター 🔢")
st.write("数値を入力して単位を選ぶと、他の単位に一括で変換します。")

col1, col2 = st.columns(2)

with col1:
    input_value = st.number_input("変換したい数値を入力してください", value=1.0, min_value=0.0)

with col2:
    input_unit = st.selectbox("単位を選択してください", ["Byte", "KB", "MB", "GB", "TB"])

if input_value > 0:
    results = convert_units(input_value, input_unit)
    conversion_table = create_conversion_table(results, input_unit)
    st.dataframe(conversion_table, width='stretch')

st.info("💡 **基本ルール**: 単位が1つ大きくなるごとに**1024**で割り、1つ小さくなるごとに**1024**を掛けます。")

st.markdown("---")

# Part 2: Storage Capacity Checker
st.header("パート2：ストレージ容量チェッカー 💾")
st.write("写真や動画などのデータが、あなたのスマホやPCのストレージに全部収まるか計算してみましょう。")

st.subheader("ステップ1: ストレージ容量の設定")
col1, col2 = st.columns(2)

with col1:
    storage_capacity = st.number_input("あなたのストレージ容量は？", value=128, min_value=1)

with col2:
    storage_unit = st.selectbox("容量の単位は？", ["GB", "TB"])

# Convert storage to MB for calculations
storage_in_mb = storage_capacity * (1024 if storage_unit == "TB" else 1) * 1024

st.subheader("ステップ2: 保存したいデータの入力")

# Initialize session state for data entries
if 'data_entries' not in st.session_state:
    st.session_state.data_entries = [{"name": "写真", "size": 10.0, "unit": "MB", "count": 5000}]

# Display existing entries
total_data_mb = 0
for i, entry in enumerate(st.session_state.data_entries):
    st.write(f"**データ {i+1}:**")
    col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1, 1])
    
    with col1:
        entry["name"] = st.text_input(f"データ名", value=entry["name"], key=f"name_{i}")
    
    with col2:
        entry["size"] = st.number_input(f"サイズ", value=float(entry["size"]), min_value=0.1, key=f"size_{i}")
    
    with col3:
        entry["unit"] = st.selectbox(f"単位", ["MB", "GB", "KB"], index=["MB", "GB", "KB"].index(entry["unit"]), key=f"unit_{i}")
    
    with col4:
        entry["count"] = st.number_input(f"個数", value=entry["count"], min_value=1, key=f"count_{i}")
    
    with col5:
        if st.button(f"削除", key=f"delete_{i}"):
            st.session_state.data_entries.pop(i)
            st.rerun()
    
    # Calculate size in MB
    unit_to_mb = {"KB": 1/1024, "MB": 1, "GB": 1024}
    data_mb = entry["size"] * entry["count"] * unit_to_mb[entry["unit"]]
    total_data_mb += data_mb
    
    st.write(f"小計: {entry['size']} {entry['unit']} × {entry['count']} 個 = {data_mb:,.1f} MB")

# Add new data button
if st.button("➕ さらにデータを追加"):
    st.session_state.data_entries.append({"name": "新しいデータ", "size": 100.0, "unit": "MB", "count": 100})
    st.rerun()

st.subheader("ステップ3: 結果の判定")

if total_data_mb > 0:
    st.write("**合計データ量の詳細:**")
    for i, entry in enumerate(st.session_state.data_entries):
        unit_to_mb = {"KB": 1/1024, "MB": 1, "GB": 1024}
        data_mb = entry["size"] * entry["count"] * unit_to_mb[entry["unit"]]
        st.write(f"- {entry['name']}: {entry['size']} {entry['unit']} × {entry['count']} 個 = {data_mb:,.1f} MB")
    
    total_data_gb = total_data_mb / 1024
    st.write(f"**総合計: {total_data_mb:,.1f} MB (約 {total_data_gb:.2f} GB)**")
    
    # Usage visualization
    usage_ratio = min(total_data_mb / storage_in_mb, 1.0)
    st.write("**使用率の可視化:**")
    st.progress(usage_ratio)
    st.write(f"使用率: {usage_ratio * 100:.1f}%")
    
    # Final judgment
    if total_data_mb > storage_in_mb:
        over_amount = total_data_gb - (storage_in_mb / 1024)
        st.error(f"❌ **容量オーバーです！**設定した{storage_capacity}{storage_unit}のストレージに、{total_data_gb:.1f}GBのデータは収まりません。{over_amount:.1f}GB分が不足しています。")
        
        # Suggestions
        st.write("**💡 解決策の提案:**")
        st.write("- データの一部を削除する")
        st.write("- より大きなストレージに変更する")
        st.write("- 外部ストレージやクラウドストレージを利用する")
        
    else:
        remaining_mb = storage_in_mb - total_data_mb
        remaining_gb = remaining_mb / 1024
        st.success(f"✅ **容量に収まります！**まだ空き容量は{remaining_gb:.1f}GBあります。")
        
        # Additional insights
        if usage_ratio > 0.8:
            st.warning("⚠️ ストレージ使用率が80%を超えています。将来的な容量不足にご注意ください。")
        elif usage_ratio < 0.5:
            st.info("💫 ストレージには十分な余裕があります。さらに多くのデータを保存できます。")

# Educational footer
st.markdown("---")
st.subheader("📚 補足情報")

with st.expander("データ単位について詳しく学ぶ"):
    st.write("""
    **基本的な単位の関係:**
    - 1 Byte = 8 bit
    - 1 KB = 1,024 Byte
    - 1 MB = 1,024 KB = 1,048,576 Byte
    - 1 GB = 1,024 MB = 1,073,741,824 Byte
    - 1 TB = 1,024 GB = 1,099,511,627,776 Byte
    
    **なぜ1024なのか？**
    コンピューターは2進法で動作するため、2の10乗（2^10 = 1024）が使われます。
    
    **日常的なファイルサイズの例:**
    - 写真（JPEG）: 2-10 MB
    - 音楽（MP3）: 3-5 MB
    - 動画（HD）: 1-5 GB
    - 映画（4K）: 20-100 GB
    """)

with st.expander("ストレージの種類と特徴"):
    st.write("""
    **HDD（ハードディスク）:**
    - 容量: 500GB - 10TB以上
    - 特徴: 大容量、安価、読み書き速度は中程度
    
    **SSD（ソリッドステートドライブ）:**
    - 容量: 128GB - 4TB程度
    - 特徴: 高速、静音、消費電力少、やや高価
    
    **スマートフォン内蔵ストレージ:**
    - 容量: 32GB - 1TB
    - 特徴: 高速、省電力、拡張困難
    
    **クラウドストレージ:**
    - 容量: 無制限（プランによる）
    - 特徴: インターネット接続必要、月額料金
    """)