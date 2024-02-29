
declare module "classnames" {
  import classNames from 'classnames'
  export default classNames
}
declare module 'qs' {
  const qs: any;
  export default qs;
}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      REACT_APP: 'development' | 'production';
    }
  }
}


type RefType = MutableRefObject<unknown> | ((instance: unknown) => void)

type CommonObjectType<T = any> = Record<string, T>
