FROM nginx:latest
# Basic Setup
RUN apt-get update
RUN apt-get install bash -y
RUN apt-get install nano -y

# Copy website files
COPY ./index.html /app/

# nginx setup
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
COPY recruit.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/recruit.conf /etc/nginx/sites-enabled/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]