import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { connect, subscribe, disconnect } from '~/services/socket';
import Like from '~/assets/like.png';
import Dislike from '~/assets/dislike.png';
import Loading from '~/components/Loading';
import api from '~/services/api';
import Match from '~/components/Match';
import Menu from '~/components/Menu';
import {
  Container,
  Developers,
  Developer,
  Bio,
  Actions,
  Center,
} from './styles';

export default function Main({ match, history }) {
  const [developers, setDevelopers] = useState([]);
  const [developer, setDeveloper] = useState(null);
  const [preload, setPreloading] = useState(false);

  const { id } = match.params;

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/developers', {
        headers: { user_id: id },
      });

      setDevelopers(data);
      setPreloading(true);
    })();
  }, [id]);

  useEffect(() => {
    disconnect();
    connect({ developer_id: id });
    subscribe('match', dev => {
      setDeveloper(dev);
    });
  }, [id]);

  async function handleLike(dev_id) {
    await api.post(
      `/developers/${dev_id}/like`,
      {},
      {
        headers: { user_id: id },
      }
    );
    setDevelopers(developers.filter(dev => dev._id !== dev_id));
  }

  async function handleDislike(dev_id) {
    await api.post(
      `/developers/${dev_id}/dislike`,
      {},
      {
        headers: { user_id: id },
      }
    );
    setDevelopers(developers.filter(dev => dev._id !== dev_id));
  }

  return (
    <Container>
      <Menu history={history} id={id} active="developers" />

      {developers.length > 0 ? (
        <Developers>
          {developers.map(dev => (
            <Developer key={dev._id} data-testid={`developer_${dev._id}`}>
              <img src={dev.avatar} alt={dev.name} />
              <Bio>
                <strong>{dev.name}</strong>
                <p>{dev.bio}</p>
              </Bio>

              <Actions>
                <button
                  data-testid={`developer_dislike_${dev._id}`}
                  title="Sai da minha stack developer nutela"
                  type="button"
                  onClick={() => handleDislike(dev._id)}
                >
                  <img src={Dislike} alt="Dislike" />
                </button>
                <button
                  data-testid={`developer_like_${dev._id}`}
                  title="Bora #codar"
                  type="button"
                  onClick={() => handleLike(dev._id)}
                >
                  <img src={Like} alt="Like" />
                </button>
              </Actions>
            </Developer>
          ))}
        </Developers>
      ) : (
        <Center>
          {!preload ? <Loading /> : 'Sem sugestões no momento :('}
        </Center>
      )}

      {developer && <Match developer={developer} setDeveloper={setDeveloper} />}
    </Container>
  );
}

Main.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
