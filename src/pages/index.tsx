import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { FaCalendarAlt, FaUserAlt } from 'react-icons/fa';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination: { results, next_page },
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState<string | null>(next_page);

  const fetchPosts = async (): Promise<void> => {
    const postsResponse = await fetch(nextPage).then(resposne =>
      resposne.json()
    );

    const postsResults = postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts(prevState => [...prevState, ...postsResults]);
    setNextPage(postsResponse.next_page);
  };

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <main className={styles.container}>
        {posts &&
          posts?.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.postItem}>
                <h2>{post?.data?.title}</h2>
                <p>{post?.data?.subtitle}</p>

                <div className={styles.postInfo}>
                  <time>
                    <FaCalendarAlt size={14} color="#BBBBBB" />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy'
                    )}
                  </time>
                  <span>
                    <FaUserAlt size={14} color="#BBBBBB" />
                    {post?.data?.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        {nextPage && (
          <button
            type="button"
            onClick={fetchPosts}
            className={styles.maisPosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 4,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const { next_page } = postsResponse;
  const postsPagination = {
    next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
