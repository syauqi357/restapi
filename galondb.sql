create schema galondb collate latin1_swedish_ci;

create table products
(
    id         int auto_increment
        primary key,
    name       varchar(255)                        not null,
    price      decimal(10, 2)                      not null,
    created_at timestamp default CURRENT_TIMESTAMP null
);

create table transactions
(
    id         int auto_increment
        primary key,
    product_id int                                 not null,
    quantity   int                                 not null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    constraint transactions_ibfk_1
        foreign key (product_id) references products (id)
            on delete cascade
);

create index product_id
    on transactions (product_id);