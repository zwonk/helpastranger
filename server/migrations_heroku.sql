drop database helpa;
create database helpa DEFAULT CHARSET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;
use helpa;

create table admins (
    id char(36) not null ,
    apikey varchar(255),
    apikeycreation timestamp,
    deleted int(2) default null,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table adminsdata (
    id char(36) not null ,
    users_id char(36) not null unique,
    username varchar(255),
    username_hash varchar(255) unique,
    passw varchar(255),
    passw_recovery varchar(255),
    passw_recovery_date timestamp null default null,
    flagged timestamp default null,
    real_name text,
    address text,
    phone text,
    email text,
    email_hash varchar(255) unique,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `adminsdata_admins_index` (`users_id`),
    constraint `adminsdata_admins_foreign` foreign key (`users_id`) references `admins` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;


create table users (
    id char(36) not null ,
    apikey varchar(255),
    apikeycreation timestamp,
    deleted int(2) default null,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table usersdata (
    id char(36) not null ,
    users_id char(36) not null unique,
    priv_key text,
    mnemonic text,
    curr_public_key_index int,
    curr_public_key varchar(255),
    username varchar(255),
    username_hash varchar(255) unique,
    passw varchar(255),
    passw_recovery varchar(255),
    passw_recovery_date timestamp null default null,
    membership_motivation text,
    membership_applied timestamp null default null,
    membership_changed timestamp null default null,
    member_state int,
    edits_num int,
    report_num int,
    withdrawals_num int,
    flagged timestamp default null,
    real_name text,
    address text,
    phone text,
    email text,
    email_hash varchar(255),
    total_donated int,
    total_donated_month int,
    total_withdrawn int,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `usersdata_users_index` (`users_id`),
    constraint `usersdata_users_foreign` foreign key (`users_id`) references `users` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table affected (
    id char(36) not null ,
    apikey varchar(255),
    apikeycreation timestamp,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table affecteddata (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36) not null unique,
    priv_key text,
    mnemonic text,
    curr_public_key varchar(255),
    curr_public_key_index int,
    edits_num int,
    report_num int,
    withdrawals_num int,
    total_donated int,
    total_donated_month int,
    total_withdrawn int,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `affecteddata_affected_index` (`affected_id`),
    constraint `affecteddata_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table recurrent_payments (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    amount int,
    fiat_amount int,
    pay_interval int(2),
    paused_state int(2),
    `last_execution` timestamp default current_timestamp,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `recurrent_payments_users_index` (`users_id`),
    key `recurrent_payments_affected_index` (`affected_id`),
    constraint `recurrent_payments_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `recurrent_payments_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table qr_codes (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    public_key varchar(255), /* can be interpreted as initital public_key */
    qr_blob text,
    secret text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `qr_codes_users_index` (`users_id`),
    key `qr_codes_affected_index` (`affected_id`),
    constraint `qr_codes_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `qr_codes_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table campaigns (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    title text not null,
    description text,
    img_link text,
    fiat_amount int,
    error_bridge text,
    txhash_bridge text,
    error text,
    txhash text,
    campaign_address text,
    campaign_address_index int,
    finished timestamp null default null,
    deleted timestamp null default null,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `campaigns_users_index` (`users_id`),
    key `campaigns_affected_index` (`affected_id`),
    constraint `campaigns_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `campaigns_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table campaigns_withdrawals (
    id char(36) not null ,
    campaigns_id char(36),
    users_id char(36),
    txhash text,
    error text,
    landing_address text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `campaigns_withdrawals_campaigns_index` (`campaigns_id`),
    key `campaigns_withdrawals_users_index` (`users_id`),
    constraint `campaigns_withdrawals_campaigns_foreign` foreign key (`campaigns_id`) references `campaigns` (`id`),
    constraint `campaigns_withdrawals_users_foreign` foreign key (`users_id`) references `users` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table donations (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    campaigns_id char(36) default null,
    amount int,
    fiat_amount int,
    crncy varchar(4),
    from_recurrent int default null,
    txhash varchar(255),
    secret text,
    error text,
    donation_free tinyint (1) null,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `donations_users_index` (`users_id`),
    key `donations_affected_index` (`affected_id`),
    key `donations_campaigns_index` (`campaigns_id`),
    constraint `donations_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `donations_affected_foreign` foreign key (`affected_id`) references `affected` (`id`),
    constraint `donations_campaigns_foreign` foreign key (`campaigns_id`) references `campaigns` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table saved (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    donations_id char(36),
    manual_save tinyint (1) null,
    qr_code varchar(255),
    secret text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `saved_users_index` (`users_id`),
    key `saved_affected_index` (`affected_id`),
    key `saved_donations_index` (`donations_id`),
    constraint `saved_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `saved_affected_foreign` foreign key (`affected_id`) references `affected` (`id`),
    constraint `saved_donations_foreign` foreign key (`donations_id`) references `donations` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table cashouts (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    amount int,
    fiat_amount int,
    crncy varchar(4),
    landing_address varchar(255),
    txhash varchar(255),
    error text,
    sendback timestamp null default null,
    sendback_txhash varchar(255),
    sendback_error text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `cashouts_users_index` (`users_id`),
    key `cashouts_affected_index` (`affected_id`),
    constraint `cashouts_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `cashouts_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table withdraws (
    id char(36) not null ,
    users_id char(36),
    amount int,
    fiat_amount int,
    crncy varchar(4),
    txhash varchar(255),
    landing_address varchar(255),
    error text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `withdraws_users_index` (`users_id`),
    constraint `withdraws_users_foreign` foreign key (`users_id`) references `users` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table withdrawals (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    sendback int(2),
    amount int,
    fiat_amount int,
    txhash varchar(255),
    landing_address varchar(255),
    delivered_state int(2) default 0,
    error text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `withdrawals_users_index` (`users_id`),
    key `withdrawals_affected_index` (`affected_id`),
    constraint `withdrawals_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `withdrawals_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table locations (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    cashouts_id char(36),
    x real,
    y real,
    location_description text,
    location_address text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `locations_affected_index` (`affected_id`),
    constraint `locations_affected_foreign` foreign key (`affected_id`) references `affected` (`id`),
    constraint `locations_cashouts_foreign` foreign key (`cashouts_id`) references `cashouts` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table edits (
    id char(36) not null ,
    users_id char(36),
    affected_id char(36),
    name text,
    appearance text,
    story text,
    videolink
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`),
    key `edits_users_index` (`users_id`),
    key `edits_affected_index` (`affected_id`),
    constraint `edits_users_foreign` foreign key (`users_id`) references `users` (`id`),
    constraint `edits_affected_foreign` foreign key (`affected_id`) references `affected` (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table reports (
    id char(36) not null ,
    users_id char(36),
    content text,
    context text,
    view text,
    cleared int(2),
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table imgs (
    id char(36) not null ,
    link text,
    description text,
    type int(3),
    active int(2) default 1 null,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

create table logs (
    id int not null auto_increment,
    ip varchar(255),
    users_id char(36),
    write_op bit,
    `created_at` timestamp default current_timestamp,
    primary key (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

