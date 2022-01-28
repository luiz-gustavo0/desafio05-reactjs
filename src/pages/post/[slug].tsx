import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCalendarAlt, FaUserAlt, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import { Fragment } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Utteranc from '../../components/Utteranc';

interface Post {
  last_publication_date: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  next: any;
  prev: any;
}

export default function Post({ post, prev, next }: PostProps): JSX.Element {
  const router = useRouter();

  return (
    <main>
      {router.isFallback ? (
        <p>Carregando...</p>
      ) : (
        <>
          <img
            src={post.data.banner.url}
            alt="Imagem"
            className={styles.postBanner}
          />

          <article
            className={`${commonStyles.container} ${styles.postContent}`}
          >
            <h1>{post.data.title}</h1>
            <div className={styles.postInfo}>
              <time>
                <FaCalendarAlt size={14} color="#BBBBBB" />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy')}
              </time>
              <span>
                <FaUserAlt size={14} color="#BBBBBB" />
                {post?.data?.author}
              </span>
              <time>
                <FaClock size={14} color="#BBBBBB" />
                {Math.ceil(
                  post.data.content.reduce((total, content) => {
                    // eslint-disable-next-line no-param-reassign
                    total += content.body.reduce(
                      // eslint-disable-next-line no-return-assign
                      (acc, paragraph) =>
                        // eslint-disable-next-line no-param-reassign
                        (acc += paragraph.text.match(/\S+\s*/g).length),
                      0
                    );
                    return total;
                  }, 0) / 200
                )}{' '}
                min
                {/* count the number of words in post and divide by 200 */}
              </time>
            </div>
            <p className={styles.postEdited}>
              *editado em{' '}
              {format(new Date(post.first_publication_date), 'dd MMM yyyy')}, às{' '}
              {format(new Date(post.first_publication_date), 'HH mm')}
            </p>

            <div className={styles.postBody}>
              {post.data.content.map(content => (
                <Fragment key={content.heading}>
                  <h2>{content.heading}</h2>
                  {content.body.map((paragraph, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                      <p>{paragraph.text}</p>
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </div>
          </article>
          <div className={styles.divider} />
          <footer className={commonStyles.container}>
            <div className={styles.postLinks}>
              {prev && (
                <div className={styles.prevPost}>
                  <h3>{prev.data.title}</h3>
                  <Link href={`/post/${prev.uid}`}>
                    <a>Post anterior</a>
                  </Link>
                </div>
              )}
              {next && (
                <div className={styles.nextPost}>
                  <h3>{next.data.title}</h3>
                  <Link href={`/post/${next.uid}`}>
                    <a>Próximo post</a>
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.comments}>
              <Utteranc />
            </div>
          </footer>
        </>
      )}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { fetch: 'post.uid' }
  );

  const slugs = posts.results.map(post => ({ params: { slug: post.uid } }));
  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const next = await prismic.queryFirst(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const prev = await prismic.queryFirst(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      author: response.data.author,
      banner: { url: response.data.banner.url },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
      prev: prev ?? null,
      next: next ?? null,
    },
  };
};
