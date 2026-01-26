#!/bin/bash
# init-ssl.sh: Automate Let's Encrypt certificate acquisition

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

domains=($1)
rsa_key_size=4096
data_path="./certbot"
email="" # Adding a valid email is recommended
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

if [ -z "$domains" ]; then
  echo "Usage: ./init-ssl.sh \"domain.com www.domain.com\" [email]"
  exit 1
fi

if [ -n "$2" ]; then
  email="$2"
fi

echo "### Requesting Let's Encrypt certificate for ${domains[*]} ..."

# Join domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

echo "### simple-requesting cert for $domains ..."

docker-compose -f infra/docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

echo
echo "### Reloading nginx ..."
docker-compose -f infra/docker-compose.prod.yml exec web nginx -s reload
