import random

_random = random.SystemRandom()


def get_random_long_int():
    return _random.randint(1000000000, 9999999999)


def get_random_short_int():
    return _random.randint(100000, 999999)


def base36_encode(number):
    assert number >= 0, 'positive integer required'
    if number == 0:
        return '0'
    base36 = []
    while number != 0:
        number, i = divmod(number, 36)
        base36.append('0123456789abcdefghijklmnopqrstuvwxyz'[i])
    return ''.join(reversed(base36))


def generate_url():
    return base36_encode(get_random_long_int())


def generate_password():
    return base36_encode(get_random_short_int())
