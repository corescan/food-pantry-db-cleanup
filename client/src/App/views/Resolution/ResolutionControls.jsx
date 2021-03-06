import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import ClientAPI from '../../../API/ClientAPI';
import makeFilterState from '../../../lib/search/makeFilterState';
import { resolveClients } from '../../../redux/actions/clientActions';
import { updateSearchFilters } from '../../../redux/actions/searchActions';

import Button from '../../components/Button';

import css from './ResolutionControls.module.css';

export default function ResolutionControls() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { target, selection, clients } = useSelector(
    ({ clientReducer }) => {
      return {
        selection: clientReducer.selection,
        target: clientReducer.target,
        clients: clientReducer.allClients
      }
    }
  );

  const handleResolution = async () => {
    /**
     * RESOLVE CLIENTS
     */
    // try API to resolve clients in DB
    ClientAPI.resolveClients(target, selection)
      .then(async (payload) => {
        const user_update = payload.find(_d => _d.type === 'UPDATE_CLIENT');
        const size = (user_update && user_update.size) || -1;
        toast.success(`Resolved ${size} client${size === 1 ? '':'s'}`)
        await resolveClients(payload)(dispatch);

    /**
     * LOAD NEXT TARGET
     */
        // find the next unmapped & active client
        const nextTarget = clients.find(_c => !_c.mapped && _c.active && _c.id !== target.id);
        // adjust filters to this client
        updateSearchFilters(makeFilterState(nextTarget))(dispatch);
        // navigate
        nav(`/resolve/${nextTarget.id}`);
      })
      .catch(err => {
        const message = err.response ? err.response.body.message : 'There was an unknown error with this submission.';
        toast.error(message, { autoClose: false });
      });
  }

  return (
    <div className={css.container} >
      <Button 
        text='Resolve'
        className={css.resolve}
        onClick={handleResolution}
      />
    </div>
  )
}
