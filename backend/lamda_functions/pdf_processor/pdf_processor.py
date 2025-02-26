import boto3
import PyPDF2
import io

s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = event['Records'][0]['s3']['object']['key']

        response = s3.get_object(Bucket=bucket, Key=key)
        pdf_file = io.BytesIO(response['Body'].read())
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()

        return {
            'statusCode': 200,
            'body': text
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': str(e)
        }