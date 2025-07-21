import pandas as pd
import urllib.request
import ssl
import zipfile
import os

base_dir = os.getcwd()
markets = ['nas', 'nys', 'ams']
columns = [
    'National code', 'Exchange id', 'Exchange code', 'Exchange name', 'Symbol', 'realtime symbol',
    'Korea name', 'English name', 'Security type(1:Index,2:Stock,3:ETP(ETF),4:Warrant)', 'currency',
    'float position', 'data type', 'base price', 'Bid order size', 'Ask order size',
    'market start time(HHMM)', 'market end time(HHMM)', 'DR 여부(Y/N)', 'DR 국가코드', '업종분류코드',
    '지수구성종목 존재 여부(0:구성종목없음,1:구성종목있음)', 'Tick size Type',
    '구분코드(001:ETF,002:ETN,003:ETC,004:Others,005:VIX Underlying ETF,006:VIX Underlying ETN)',
    'Tick size type 상세'
]

def get_market_df(val):
    ssl._create_default_https_context = ssl._create_unverified_context
    zip_path = os.path.join(base_dir, f"{val}mst.cod.zip")
    cod_path = os.path.join(base_dir, f"{val}mst.cod")
    urllib.request.urlretrieve(
        f"https://new.real.download.dws.co.kr/common/master/{val}mst.cod.zip", zip_path
    )
    with zipfile.ZipFile(zip_path) as z:
        z.extractall(base_dir)
    df = pd.read_table(cod_path, sep='\t', encoding='cp949', header=None)
    df.columns = columns
    # 필요한 컬럼만 추출
    df = df[['Exchange name','Symbol', 'Korea name', 'English name', 'Security type(1:Index,2:Stock,3:ETP(ETF),4:Warrant)']]
    # 파일 정리
    os.remove(zip_path)
    os.remove(cod_path)
    return df

all_df = pd.DataFrame()
for m in markets:
    print(f"Processing {m} ...")
    temp = get_market_df(m)
    all_df = pd.concat([all_df, temp], axis=0)

all_df.to_excel('us_stock_etf_code.xlsx', index=False)
print("Done! 미국 3개 거래소 Symbol, Korea name, English name, Security type만 추출 완료.")