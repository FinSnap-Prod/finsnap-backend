import urllib.request
import ssl
import zipfile
import os
import pandas as pd

base_dir = os.getcwd()

def kospi_master_download(base_dir, verbose=False):
    cwd = os.getcwd()
    if (verbose): print(f"current directory is {cwd}")
    ssl._create_default_https_context = ssl._create_unverified_context

    # Download and extract zip file
    zip_path = os.path.join(base_dir, "kospi_code.zip")
    urllib.request.urlretrieve("https://new.real.download.dws.co.kr/common/master/kospi_code.mst.zip", zip_path)

    with zipfile.ZipFile(zip_path, 'r') as kospi_zip:
        kospi_zip.extractall(base_dir)

    # Clean up zip file
    if os.path.exists(zip_path):
        os.remove(zip_path)

    if (verbose): print(f"Download and extraction completed in {base_dir}")


def get_kospi_master_dataframe(base_dir):
    file_name = os.path.join(base_dir, "kospi_code.mst")
    tmp_fil1 = os.path.join(base_dir, "kospi_code_part1.tmp")
    tmp_fil2 = os.path.join(base_dir, "kospi_code_part2.tmp")

    try:
        wf1 = open(tmp_fil1, mode="w", encoding='cp949')
        wf2 = open(tmp_fil2, mode="w", encoding='cp949')

        with open(file_name, mode="r", encoding='cp949') as f:
            for row in f:
                rf1 = row[0:len(row) - 228]
                rf1_1 = rf1[0:9].rstrip()
                rf1_2 = rf1[9:21].rstrip()
                rf1_3 = rf1[21:].strip()
                wf1.write(rf1_1 + ',' + rf1_2 + ',' + rf1_3 + '\n')
                rf2 = row[-228:]
                wf2.write(rf2)

        wf1.close()
        wf2.close()

        part1_columns = ['단축코드', '표준코드', '한글명']
        df1 = pd.read_csv(tmp_fil1, header=None, names=part1_columns, encoding='cp949')

        field_specs = [2]

        part2_columns = ['그룹코드']

        df2 = pd.read_fwf(tmp_fil2, widths=field_specs, names=part2_columns)

        df = pd.merge(df1, df2, how='outer', left_index=True, right_index=True)

        # clean temporary file and dataframe
        del (df1)
        del (df2)
        os.remove(tmp_fil1)
        os.remove(tmp_fil2)
        
        print("Done")

        return df
    except Exception as e:
        print(f"Error in get_kospi_master_dataframe: {e}")
        return None



kospi_master_download(base_dir)
df = get_kospi_master_dataframe(base_dir)

# 그룹코드가 'ST' 또는 'EF' 인 데이터만 추출
df_selected = df[df['그룹코드'].isin(['ST', 'EF'])]

# 엑셀로 저장
df_selected.to_excel('kospi-master.xlsx', index=False)

print("ST, EF 종목만 저장 완료")