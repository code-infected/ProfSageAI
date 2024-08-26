import requests
from bs4 import BeautifulSoup

def scrape_rmp_data(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extracting the professor's name
    first_name_element = soup.find('div', class_='NameTitle__Name-dowf0z-0 cfjPUG')
    last_name_element = soup.find('div', class_='NameTitle__LastNameWrapper-dowf0z-2 glXOHH')
    
    first_name = first_name_element.text.strip() if first_name_element else ''
    last_name = last_name_element.text.strip() if last_name_element else ''
    full_name = f'{first_name} {last_name}'

    # Extracting the overall rating
    rating_element = soup.find('div', class_='RatingValue__Numerator-qw8sqy-2')
    rating = rating_element.text.strip() if rating_element else 'N/A'

    # Extracting reviews
    reviews_divs = soup.find_all('div', class_='Comments__StyledComments-dzzyvm-0')
    reviews = [review.text.strip() for review in reviews_divs]

    # Printing the scraped data
    print(f'Professor Name: {full_name}')
    print(f'Overall Rating: {rating}')
    print('Reviews:')
    for idx, review in enumerate(reviews, 1):
        print(f'{idx}. {review}')

# Example usage
url = 'https://www.ratemyprofessors.com/professor/1886810'  # Replace with the actual URL
scrape_rmp_data(url)
